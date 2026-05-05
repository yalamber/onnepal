import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { markAsRead } from '@/lib/db/queries/notifications';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const db = getDb(getD1Database());
    await markAsRead(db, session.userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/notifications/:id] PATCH failed', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
