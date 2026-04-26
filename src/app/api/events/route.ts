import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getEvents, getEventsCount, createEvent } from '@/lib/db/queries/events';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).nullish(),
  category: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().nullish(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  venue: z.string().max(200).nullish(),
  location: z.string().max(200).nullish(),
  ticketPrice: z.string().max(100).nullish(),
  ticketUrl: z.string().max(500).nullish(),
  contactPhone: z.string().max(20).nullish(),
  contactWhatsapp: z.string().max(20).nullish(),
  imageUrls: z.array(z.string().max(500)).max(5).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get('category') || undefined;
    const search = sp.get('search') || undefined;
    const location = sp.get('location') || undefined;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(sp.get('limit') || '12', 10)));

    const d1 = getD1Database();
    const db = getDb(d1);

    const [items, total] = await Promise.all([
      getEvents(db, { category, search, location, page, limit }),
      getEventsCount(db, { category, search, location }),
    ]);

    return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });

    if (validation.data.imageUrls) {
      const invalid = validation.data.imageUrls.some((url) => !url.startsWith(session.userId + '/'));
      if (invalid) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });
    }

    const d1 = getD1Database();
    const db = getDb(d1);
    const result = await createEvent(db, session.userId, {
      ...validation.data,
      description: validation.data.description ?? undefined,
      endDate: validation.data.endDate ?? undefined,
      startTime: validation.data.startTime ?? undefined,
      endTime: validation.data.endTime ?? undefined,
      venue: validation.data.venue ?? undefined,
      location: validation.data.location ?? undefined,
      ticketPrice: validation.data.ticketPrice ?? undefined,
      ticketUrl: validation.data.ticketUrl ?? undefined,
      contactPhone: validation.data.contactPhone ?? undefined,
      contactWhatsapp: validation.data.contactWhatsapp ?? undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
