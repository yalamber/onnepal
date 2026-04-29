import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getPlaceById, deletePlace, updatePlace } from '@/lib/db/queries/places';
import { z } from 'zod';
import { getSession, isAdmin } from '@/lib/auth/session';

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).nullish(),
  category: z.string().optional(),
  location: z.string().max(200).nullish(),
  city: z.string().max(100).nullish(),
  address: z.string().max(500).nullish(),
  contactPhone: z.string().max(20).nullish(),
  contactWhatsapp: z.string().max(20).nullish(),
  website: z.string().max(500).nullish(),
  imageUrls: z.array(z.string().max(500)).max(5).nullish(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);
    const item = await getPlaceById(db, id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    console.error('Get place error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const validation = updateSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const d1 = await getD1Database();
    const db = getDb(d1);
    const admin = await isAdmin(session.userId);
    const item = admin ? await getPlaceById(db, id) : null;
    await updatePlace(db, id, admin && item ? item.userId : session.userId, validation.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update place error:', error);
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
    const item = admin ? await getPlaceById(db, id) : null;
    await deletePlace(db, id, admin && item ? item.userId : session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete place error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
