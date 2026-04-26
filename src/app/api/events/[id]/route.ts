import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getEventById, deleteEvent, updateEvent } from '@/lib/db/queries/events';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).nullish(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullish(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  venue: z.string().max(200).nullish(),
  location: z.string().max(200).nullish(),
  ticketPrice: z.string().max(100).nullish(),
  ticketUrl: z.string().max(500).nullish(),
  contactPhone: z.string().max(20).nullish(),
  contactWhatsapp: z.string().max(20).nullish(),
  imageUrls: z.array(z.string().max(500)).max(5).nullish(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
});
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
    const item = admin ? await getEventById(db, id) : null;
    await updateEvent(db, id, admin && item ? item.userId : session.userId, validation.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update event error:', error);
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
