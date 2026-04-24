import { NextResponse } from 'next/server';
import { getAllOffers, createOffer } from '@/lib/db/queries/offers';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const items = await getAllOffers(auth.db, auth.businessId);

    return NextResponse.json({ offers: items });
  } catch (error) {
    console.error('Get offers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      discountText?: string;
      code?: string;
      startsAt?: string;
      expiresAt?: string;
    };

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await createOffer(auth.db, auth.businessId, {
      title: body.title,
      description: body.description || undefined,
      discountText: body.discountText || undefined,
      code: body.code || undefined,
      startsAt: body.startsAt || undefined,
      expiresAt: body.expiresAt || undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create offer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
