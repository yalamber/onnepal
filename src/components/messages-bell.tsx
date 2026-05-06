'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, MessageSquare, Check, Loader2 } from 'lucide-react';

interface ThreadPreview {
  otherUserId: string;
  otherUserName: string | null;
  listingType: string;
  listingId: string;
  listingTitle: string;
  lastMessage: string;
  lastAt: number;
  unread: number;
}

const POLL_MS = 30_000;

function relativeTime(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props { /** False when logged-out — renders nothing. */ enabled: boolean }

export function MessagesBell({ enabled }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<ThreadPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedThisOpenRef = useRef(false);

  // Single endpoint returns BOTH count and recent threads. Used for both the
  // initial render (count only) and the popover open (threads).
  const refresh = useCallback(async (loadThreads = false) => {
    if (!enabled) return;
    if (loadThreads) setLoading(true);
    try {
      const res = await fetch('/api/messages/preview');
      if (!res.ok) return;
      const d = (await res.json()) as { count?: number; threads?: ThreadPreview[] };
      if (typeof d.count === 'number') setCount(d.count);
      if (loadThreads && Array.isArray(d.threads)) setThreads(d.threads);
    } catch {}
    finally { if (loadThreads) setLoading(false); }
  }, [enabled]);

  // Initial count + 30s poll. Pause when document.hidden.
  useEffect(() => {
    if (!enabled) return;
    refresh();
    let id: ReturnType<typeof setInterval> | undefined;
    const start = () => { if (!id) id = setInterval(() => refresh(false), POLL_MS); };
    const stop = () => { if (id) { clearInterval(id); id = undefined; } };
    if (typeof document !== 'undefined' && !document.hidden) start();
    const onVis = () => { if (document.hidden) stop(); else { refresh(false); start(); } };
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [enabled, refresh]);

  // Outside-click + Escape close.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open) {
      fetchedThisOpenRef.current = false;
      setOpen(true);
      if (!fetchedThisOpenRef.current) {
        fetchedThisOpenRef.current = true;
        refresh(true);
      }
    } else {
      setOpen(false);
    }
  };

  const handleThreadClick = async (t: ThreadPreview) => {
    // Optimistic: decrement count + mark this thread read in local state
    if (t.unread > 0) {
      setThreads((prev) => prev.map((x) =>
        x.otherUserId === t.otherUserId && x.listingId === t.listingId && x.listingType === t.listingType
          ? { ...x, unread: 0 }
          : x
      ));
      setCount((c) => Math.max(0, c - 1));
      fetch('/api/messages/mark-thread-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otherUserId: t.otherUserId,
          listingType: t.listingType,
          listingId: t.listingId,
        }),
      }).catch(() => {});
    }
    setOpen(false);
    // Deep-link into /dashboard/messages with enough info for the page to
    // auto-open the matching thread (handled there via useSearchParams).
    const sp = new URLSearchParams({
      otherUserId: t.otherUserId,
      listingType: t.listingType,
      listingId: t.listingId,
    });
    router.push(`/dashboard/messages?${sp.toString()}`);
  };

  if (!enabled) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="icon-btn"
        aria-label={count > 0 ? `${count} unread thread${count === 1 ? '' : 's'}` : 'Messages'}
        aria-expanded={open}
        onClick={handleToggle}
      >
        <Mail size={20} />
        {count > 0 && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-medium leading-4 text-center"
            style={{ background: 'var(--crimson-600)', color: '#fff' }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[min(360px,calc(100vw-32px))] z-[60] rounded-[var(--r-md)] border bg-[var(--paper)] shadow-[var(--shadow-lg)]"
          style={{ borderColor: 'var(--ink-200)', animation: 'dd-in var(--dur-1) var(--ease)' }}
          role="region"
          aria-label="Messages"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--ink-200)]">
            <div className="t-eyebrow">{count > 0 ? `${count} unread thread${count === 1 ? '' : 's'}` : 'Messages'}</div>
            <Link
              href="/dashboard/messages"
              onClick={() => setOpen(false)}
              className="text-xs text-[var(--accent)] hover:underline underline-offset-4"
            >
              Inbox →
            </Link>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && threads.length === 0 ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--ink-400)]" />
              </div>
            ) : threads.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <Check className="h-6 w-6 mx-auto text-[var(--ink-300)] mb-2" />
                <p className="text-sm text-[var(--ink-500)]">No conversations yet.</p>
              </div>
            ) : (
              <ul>
                {threads.map((t) => {
                  const key = `${t.otherUserId}:${t.listingType}:${t.listingId}`;
                  const isUnread = t.unread > 0;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => handleThreadClick(t)}
                        className={`w-full text-left flex gap-3 px-3 py-3 hover:bg-[var(--ink-50)] transition-colors ${isUnread ? 'bg-[var(--accent-soft)]/30' : ''}`}
                      >
                        <span className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--teal-100)] text-[var(--teal-700)]">
                          <MessageSquare size={16} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className={`text-sm truncate ${isUnread ? 'font-semibold text-[var(--ink-900)]' : 'text-[var(--ink-700)]'}`}>
                              {t.otherUserName || 'OnNepal user'}
                            </p>
                            <span className="text-[11px] text-[var(--ink-500)] flex-shrink-0">{relativeTime(t.lastAt)}</span>
                          </div>
                          <p className="text-[11px] text-[var(--ink-500)] truncate mt-0.5">
                            About <em>{t.listingTitle}</em>
                          </p>
                          <p className={`text-xs mt-1 line-clamp-2 ${isUnread ? 'text-[var(--ink-900)]' : 'text-[var(--ink-500)]'}`}>
                            {t.lastMessage}
                          </p>
                        </div>
                        {isUnread && (
                          <span
                            aria-hidden
                            className="self-center w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: 'var(--accent)' }}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-[var(--ink-200)] bg-[var(--ink-50)]">
            <Link
              href="/dashboard/messages"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-xs text-center text-[var(--accent)] hover:underline underline-offset-4"
            >
              See all messages →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
