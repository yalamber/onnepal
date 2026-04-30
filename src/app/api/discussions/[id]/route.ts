import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getDiscussionById, deleteDiscussion, getReplies } from '@/lib/db/queries/discussions';
import { getSession, isAdmin } from '@/lib/auth/session';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);
    const [item, replies] = await Promise.all([
      getDiscussionById(db, id),
      getReplies(db, id),
    ]);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item, replies });
  } catch (error) {
    console.error('Get discussion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);
    const admin = await isAdmin(session.userId);
    const item = admin ? await getDiscussionById(db, id) : null;
    await deleteDiscussion(db, id, admin && item ? item.userId : session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete discussion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
