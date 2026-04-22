import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getClassifiedById, deleteClassified } from '@/lib/db/queries/classifieds';
import { getSession } from '@/lib/auth/session';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);

    const listing = await getClassifiedById(db, id);
    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Get classified error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);

    await deleteClassified(db, id, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete classified error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
