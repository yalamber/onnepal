import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { getNotifications, getNotificationsCount } from '@/lib/db/queries/notifications';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp = request.nextUrl.searchParams;
    const unreadOnly = sp.get('unread') === '1';
    const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') ?? '20', 10)));

    const db = getDb(getD1Database());
    const [items, total] = await Promise.all([
      getNotifications(db, session.userId, { unreadOnly, page, limit }),
      getNotificationsCount(db, session.userId, { unreadOnly }),
    ]);

    const res = NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) });
    // Don't cache — notifications must be fresh per user.
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  } catch (err) {
    console.error('[api/notifications] failed', err);
    return NextResponse.json({ items: [], total: 0, page: 1, totalPages: 0 });
  }
}
