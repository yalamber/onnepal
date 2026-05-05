'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, MessageSquare, Star, Calendar, MessageCircle,
  Feather, AlertTriangle, Check, Loader2,
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

const ICON_FOR_TYPE: Record<NotificationType, React.ComponentType<{ size?: number }>> = {
  message_received: MessageSquare,
  review_received: Star,
  booking_received: Calendar,
  comment_received: MessageCircle,
  voice_approved: Feather,
  voice_rejected: Feather,
  voice_pending: Feather,
  report_received: AlertTriangle,
};

const TONE_FOR_TYPE: Record<NotificationType, string> = {
  message_received: 'text-[var(--teal-700)] bg-[var(--teal-100)]',
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
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  initialItems: Notification[];
  initialUnreadOnly: boolean;
  initialPage: number;
  totalPages: number;
}

export function NotificationsList({ initialItems, initialUnreadOnly, initialPage, totalPages }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [unreadOnly, setUnreadOnly] = useState(initialUnreadOnly);
  const [marking, setMarking] = useState(false);

  const switchFilter = (next: boolean) => {
    setUnreadOnly(next);
    const sp = new URLSearchParams();
    if (next) sp.set('unread', '1');
    router.push(`/notifications${sp.toString() ? `?${sp}` : ''}`);
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((i) => i.id === n.id ? { ...i, isRead: true } : i));
      fetch(`/api/notifications/${n.id}`, { method: 'PATCH' }).catch(() => {});
    }
    if (n.linkHref) router.push(n.linkHref);
  };

  const handleMarkAll = async () => {
    setMarking(true);
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    } finally {
      setMarking(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 rounded-[var(--r-pill)] border border-[var(--ink-200)] bg-[var(--paper)]">
          <button
            type="button"
            onClick={() => switchFilter(false)}
            className={`px-3 py-1.5 rounded-[var(--r-pill)] text-sm transition-colors ${
              !unreadOnly ? 'bg-[var(--ink-900)] text-[var(--paper)]' : 'text-[var(--ink-700)] hover:text-[var(--ink-900)]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => switchFilter(true)}
            className={`px-3 py-1.5 rounded-[var(--r-pill)] text-sm transition-colors ${
              unreadOnly ? 'bg-[var(--ink-900)] text-[var(--paper)]' : 'text-[var(--ink-700)] hover:text-[var(--ink-900)]'
            }`}
          >
            Unread
          </button>
        </div>
        <button
          type="button"
          onClick={handleMarkAll}
          disabled={marking || items.every((i) => i.isRead)}
          className="btn btn-ghost"
        >
          {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Mark all as read
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--ink-200)] rounded-[var(--r-lg)] py-16 text-center">
          <Bell className="h-6 w-6 mx-auto text-[var(--ink-300)] mb-3" />
          <p className="t-eyebrow justify-center mb-2">{unreadOnly ? 'No unread' : 'Nothing yet'}</p>
          <p className="text-[var(--ink-500)]">
            {unreadOnly ? 'You’re all caught up.' : 'Notifications will appear here as activity happens on your account.'}
          </p>
        </div>
      ) : (
        <ul className="border border-[var(--ink-200)] rounded-[var(--r-lg)] overflow-hidden bg-[var(--paper)]">
          {items.map((n) => {
            const Icon = ICON_FOR_TYPE[n.type] ?? Bell;
            const tone = TONE_FOR_TYPE[n.type] ?? 'text-[var(--ink-700)] bg-[var(--ink-100)]';
            return (
              <li key={n.id} className="border-b border-[var(--ink-100)] last:border-0">
                <button
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left flex gap-4 px-4 py-4 hover:bg-[var(--ink-50)] transition-colors ${n.isRead ? '' : 'bg-[var(--accent-soft)]/20'}`}
                >
                  <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${tone}`}>
                    <Icon size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[var(--ink-900)] font-medium">{n.title}</p>
                      <span className="t-meta flex-shrink-0">{relativeTime(n.createdAt)}</span>
                    </div>
                    {n.body && <p className="text-sm text-[var(--ink-500)] mt-1">{n.body}</p>}
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

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          {initialPage > 1 && (
            <Link
              href={{ pathname: '/notifications', query: { ...(unreadOnly ? { unread: '1' } : {}), page: initialPage - 1 } }}
              className="btn btn-ghost"
            >
              ← Newer
            </Link>
          )}
          <span className="t-meta">Page {initialPage} of {totalPages}</span>
          {initialPage < totalPages && (
            <Link
              href={{ pathname: '/notifications', query: { ...(unreadOnly ? { unread: '1' } : {}), page: initialPage + 1 } }}
              className="btn btn-ghost"
            >
              Older →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
