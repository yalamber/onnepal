import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { getNotifications, getNotificationsCount } from '@/lib/db/queries/notifications';
import { NotificationsList } from './notifications-list';

export const metadata: Metadata = { title: 'Notifications — OnNepal' };

export default async function NotificationsPage({
  searchParams,
}: { searchParams: Promise<{ unread?: string; page?: string }> }) {
  const session = await getSession();
  if (!session) redirect('/login?next=/notifications');

  const sp = await searchParams;
  const unreadOnly = sp.unread === '1';
  const page = Math.max(1, parseInt(sp.page ?? '1', 10));
  const limit = 30;

  const db = getDb(getD1Database());
  const [items, total] = await Promise.all([
    getNotifications(db, session.userId, { unreadOnly, page, limit }),
    getNotificationsCount(db, session.userId, { unreadOnly }),
  ]);

  return (
    <main>
      <div className="page-hero">
        <div className="t-eyebrow"><span className="dot" /> {total} {unreadOnly ? 'unread' : 'total'}</div>
        <h1 className="page-hero-title"><em>Notifications.</em></h1>
        <p className="page-hero-sub">
          Everything that&rsquo;s happened on your account. New first.
        </p>
      </div>

      <div className="page-shell pb-24">
        <NotificationsList
          initialItems={items}
          initialUnreadOnly={unreadOnly}
          initialPage={page}
          totalPages={Math.max(1, Math.ceil(total / limit))}
        />
      </div>
    </main>
  );
}
