import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { markAllAsRead } from '@/lib/db/queries/notifications';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb(getD1Database());
    await markAllAsRead(db, session.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/notifications/mark-all-read] failed', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
