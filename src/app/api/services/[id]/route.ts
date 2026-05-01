import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getServiceById, deleteService } from '@/lib/db/queries/services';
import { getSession, isAdmin } from '@/lib/auth/session';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const d1 = getD1Database();
    const db = getDb(d1);
    const item = await getServiceById(db, id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    console.error('Get service error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const d1 = getD1Database();
    const db = getDb(d1);
    const admin = await isAdmin(session.userId);
    if (admin) {
      const item = await getServiceById(db, id);
      if (item) await deleteService(db, id, item.userId);
    } else {
      await deleteService(db, id, session.userId);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
