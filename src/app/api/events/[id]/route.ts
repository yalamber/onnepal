import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getEventById, deleteEvent } from '@/lib/db/queries/events';
import { getSession, isAdmin } from '@/lib/auth/session';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);
    const item = await getEventById(db, id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    console.error('Get event error:', error);
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
    const item = admin ? await getEventById(db, id) : null;
    await deleteEvent(db, id, admin && item ? item.userId : session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
