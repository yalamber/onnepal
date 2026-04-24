import { NextResponse } from 'next/server';
import { getBookings, createBooking } from '@/lib/db/queries/bookings';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';

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

    const result = await createBooking(db, businessId, {
      customerName: body.customerName,
      customerPhone: body.customerPhone || undefined,
      customerEmail: body.customerEmail || undefined,
      date: body.date,
      time: body.time || undefined,
      service: body.service || undefined,
      message: body.message || undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
