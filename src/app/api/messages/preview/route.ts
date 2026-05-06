import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { getConversations, getUnreadThreadCount } from '@/lib/db/queries/messages';

const PREVIEW_LIMIT = 8;

export async function GET() {
  try {
    const session = await getSession();
    // Anonymous: same shape, zero data, so the bell render path doesn't need
    // to special-case auth.
    if (!session) return NextResponse.json({ count: 0, threads: [] });

    const db = getDb(getD1Database());
    const [count, conversations] = await Promise.all([
      getUnreadThreadCount(db, session.userId),
      getConversations(db, session.userId),
    ]);

    // Sort newest first and trim to popover size. getConversations already
    // builds rows from a DESC-sorted message list, so iteration order is
    // already most-recent-first; explicit sort here is defensive.
    const threads = [...conversations]
      .sort((a, b) => (b.lastAt instanceof Date ? b.lastAt.getTime() : Number(b.lastAt)) -
                      (a.lastAt instanceof Date ? a.lastAt.getTime() : Number(a.lastAt)))
      .slice(0, PREVIEW_LIMIT)
      .map((c) => ({
        otherUserId: c.otherUserId,
        otherUserName: c.otherUserName,
        listingType: c.listingType,
        listingId: c.listingId,
        listingTitle: c.listingTitle,
        lastMessage: c.lastMessage,
        lastAt: c.lastAt instanceof Date ? c.lastAt.getTime() : Number(c.lastAt),
        unread: c.unread,
      }));

    const res = NextResponse.json({ count, threads });
    // Per-user, never cache.
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  } catch (err) {
    console.error('[api/messages/preview] failed', err);
    return NextResponse.json({ count: 0, threads: [] });
  }
}
