import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { deleteReply, adminDeleteReply } from '@/lib/db/queries/discussions';
import { getSession, isAdmin } from '@/lib/auth/session';

export async function DELETE(_: Request, { params }: { params: Promise<{ replyId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { replyId } = await params;
    const d1 = getD1Database();
    const db = getDb(d1);

    const admin = await isAdmin(session.userId);
    if (admin) {
      await adminDeleteReply(db, replyId);
    } else {
      await deleteReply(db, replyId, session.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reply error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
