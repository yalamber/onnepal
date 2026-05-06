'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, Check, Star, Calendar, MessageCircle,
  Feather, AlertTriangle, Loader2,
} from 'lucide-react';
import type { NotificationType } from '@/lib/db/queries/notifications';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  linkHref: string | null;
  isRead: boolean;
  createdAt: number;
}

const POLL_MS = 30_000;
const POPOVER_LIMIT = 8;

const ICON_FOR_TYPE: Record<NotificationType, React.ComponentType<{ size?: number; className?: string }>> = {
  review_received: Star,
  booking_received: Calendar,
  comment_received: MessageCircle,
  voice_approved: Feather,
  voice_rejected: Feather,
  voice_pending: Feather,
  report_received: AlertTriangle,
};

const TONE_FOR_TYPE: Record<NotificationType, string> = {
  review_received: 'text-[var(--saffron-600)] bg-[var(--saffron-100)]',
  booking_received: 'text-[var(--evergreen-700)] bg-[var(--evergreen-100)]',
  comment_received: 'text-[var(--ink-700)] bg-[var(--ink-100)]',
  voice_approved: 'text-[var(--evergreen-700)] bg-[var(--evergreen-100)]',
  voice_rejected: 'text-[var(--crimson-700)] bg-[var(--crimson-100)]',
  voice_pending: 'text-[var(--saffron-600)] bg-[var(--saffron-100)]',
  report_received: 'text-[var(--crimson-700)] bg-[var(--crimson-100)]',
};

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

interface Props { /** When false, the bell is hidden (e.g. logged-out user). */ enabled: boolean }

export function NotificationsBell({ enabled }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedThisOpenRef = useRef(false);

  const refreshCount = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch('/api/notifications/count');
      if (!res.ok) return;
      const d = (await res.json()) as { count?: number };
      if (typeof d.count === 'number') setCount(d.count);
    } catch {}
  }, [enabled]);

  // Initial + 30s poll. Pauses when document is hidden so we don't waste
  // requests on a backgrounded tab.
  useEffect(() => {
    if (!enabled) return;
    refreshCount();
    let id: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (id) return;
      id = setInterval(refreshCount, POLL_MS);
    };
    const stop = () => {
      if (id) { clearInterval(id); id = undefined; }
    };
    if (typeof document !== 'undefined' && !document.hidden) start();
    const onVis = () => {
      if (document.hidden) stop(); else { refreshCount(); start(); }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [enabled, refreshCount]);

  // Close on outside click + Escape.
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

  // Fetch the popover items once per open.
  const loadItems = useCallback(async () => {
    if (fetchedThisOpenRef.current) return;
    fetchedThisOpenRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?limit=${POPOVER_LIMIT}`);
      if (!res.ok) return;
      const d = (await res.json()) as { items?: Notification[] };
      if (Array.isArray(d.items)) setItems(d.items);
    } catch {}
    finally { setLoading(false); }
  }, []);

  const handleToggle = () => {
    if (!open) {
      fetchedThisOpenRef.current = false;
      setOpen(true);
      loadItems();
    } else {
      setOpen(false);
    }
  };

  const handleItemClick = async (n: Notification) => {
    // Optimistic mark-as-read
    if (!n.isRead) {
      setItems((prev) => prev.map((i) => i.id === n.id ? { ...i, isRead: true } : i));
      setCount((c) => Math.max(0, c - 1));
      fetch(`/api/notifications/${n.id}`, { method: 'PATCH' }).catch(() => {});
    }
    setOpen(false);
    if (n.linkHref) router.push(n.linkHref);
  };

  const handleMarkAllRead = async () => {
    if (count === 0) return;
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    setCount(0);
    try { await fetch('/api/notifications/mark-all-read', { method: 'POST' }); } catch {}
  };

  if (!enabled) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="icon-btn"
        aria-label={count > 0 ? `${count} unread notification${count === 1 ? '' : 's'}` : 'Notifications'}
        aria-expanded={open}
        onClick={handleToggle}
      >
        <Bell size={20} />
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
          className="absolute right-0 top-[calc(100%+8px)] w-[min(340px,calc(100vw-32px))] z-[60] rounded-[var(--r-md)] border bg-[var(--paper)] shadow-[var(--shadow-lg)]"
          style={{ borderColor: 'var(--ink-200)', animation: 'dd-in var(--dur-1) var(--ease)' }}
          role="region"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--ink-200)]">
            <div className="t-eyebrow">{count > 0 ? `${count} unread` : 'Notifications'}</div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={count === 0}
              className="text-xs text-[var(--accent)] hover:underline underline-offset-4 disabled:opacity-30 disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--ink-400)]" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <Check className="h-6 w-6 mx-auto text-[var(--ink-300)] mb-2" />
                <p className="text-sm text-[var(--ink-500)]">You&rsquo;re all caught up.</p>
              </div>
            ) : (
              <ul>
                {items.map((n) => {
                  const Icon = ICON_FOR_TYPE[n.type] ?? Bell;
                  const tone = TONE_FOR_TYPE[n.type] ?? 'text-[var(--ink-700)] bg-[var(--ink-100)]';
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(n)}
                        className={`w-full text-left flex gap-3 px-3 py-3 hover:bg-[var(--ink-50)] transition-colors ${n.isRead ? '' : 'bg-[var(--accent-soft)]/30'}`}
                      >
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${tone}`}>
                          <Icon size={16} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="text-sm text-[var(--ink-900)] font-medium truncate">{n.title}</p>
                            <span className="text-[11px] text-[var(--ink-500)] flex-shrink-0">{relativeTime(n.createdAt)}</span>
                          </div>
                          {n.body && <p className="text-xs text-[var(--ink-500)] mt-0.5 line-clamp-2">{n.body}</p>}
                        </div>
                        {!n.isRead && (
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
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-xs text-center text-[var(--accent)] hover:underline underline-offset-4"
            >
              See all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
