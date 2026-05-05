import { NextResponse } from 'next/server';
import { getBookings, createBooking } from '@/lib/db/queries/bookings';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { bookings, businesses } from '@/lib/db/schema';
import { eq, and, gte, count } from 'drizzle-orm';
import { createNotification } from '@/lib/db/queries/notifications';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const items = await getBookings(auth.db, auth.businessId);

    return NextResponse.json({ bookings: items });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Public route — no auth required (booking form submission)
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const body = (await request.json()) as {
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      date?: string;
      time?: string;
      service?: string;
      message?: string;
    };

    if (!body.customerName || typeof body.customerName !== 'string') {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!body.date || typeof body.date !== 'string') {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const d1 = getD1Database();
    const db = getDb(d1);

    // Rate limit: max 10 bookings per business per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentCount] = await db
      .select({ count: count() })
      .from(bookings)
      .where(and(eq(bookings.businessId, businessId), gte(bookings.createdAt, oneDayAgo)));

    if (recentCount && recentCount.count >= 10) {
      return NextResponse.json(
        { error: 'Too many booking requests for this business today. Please try again later.' },
        { status: 429 }
      );
    }

    const result = await createBooking(db, businessId, {
      customerName: body.customerName,
      customerPhone: body.customerPhone || undefined,
      customerEmail: body.customerEmail || undefined,
      date: body.date,
      time: body.time || undefined,
      service: body.service || undefined,
      message: body.message || undefined,
    });

    // Notify business owner.
    const biz = await db
      .select({ userId: businesses.userId, name: businesses.businessName })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);
    if (biz[0]) {
      await createNotification(db, {
        userId: biz[0].userId,
        type: 'booking_received',
        title: `New booking inquiry on ${biz[0].name}`,
        body: `${body.customerName} requested ${body.date}${body.time ? ` at ${body.time}` : ''}${body.service ? ` for ${body.service}` : ''}`,
        linkHref: '/dashboard/bookings',
      });
    }

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
