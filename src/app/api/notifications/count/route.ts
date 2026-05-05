import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { getUnreadCount } from '@/lib/db/queries/notifications';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ count: 0 });

    const db = getDb(getD1Database());
    const count = await getUnreadCount(db, session.userId);
    const res = NextResponse.json({ count });
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  } catch (err) {
    console.error('[api/notifications/count] failed', err);
    return NextResponse.json({ count: 0 });
  }
}
