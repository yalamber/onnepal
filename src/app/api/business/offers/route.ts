import { NextResponse } from 'next/server';
import { getAllOffers, createOffer } from '@/lib/db/queries/offers';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';
import { z } from 'zod';

const offerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullish(),
  discountText: z.string().max(100).nullish(),
  code: z.string().max(50).nullish(),
  startsAt: z.string().nullish(),
  expiresAt: z.string().nullish(),
});

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

    const raw = await request.json();
    const validation = offerSchema.safeParse(raw);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const body = validation.data;

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
