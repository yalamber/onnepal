import { NextRequest, NextResponse } from 'next/server';
import { resolveCity } from '@/lib/helpers/city';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getPlaces, getPlacesCount, createPlace } from '@/lib/db/queries/places';
import { getSession } from '@/lib/auth/session';
import { createPlaceSchema } from '@/lib/validators/listings';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get('category') || undefined;
    const search = sp.get('search') || undefined;
    const location = sp.get('location') || undefined;
    const city = await resolveCity(request, sp.get('city'));
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(sp.get('limit') || '12', 10)));

    const d1 = getD1Database();
    const db = getDb(d1);

    const [items, total] = await Promise.all([
      getPlaces(db, { category, search, location, city, page, limit }),
      getPlacesCount(db, { category, search, location, city }),
    ]);

    const res = NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) });
    res.headers.set('Cache-Control', 'public, s-maxage=300');
    return res;
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const d1 = getD1Database();
    const rl = await checkRateLimit(d1, 'place:create', session.userId, 5, 86400);
    if (!rl.allowed) return tooManyRequests(86400);

    const body = await request.json();
    const validation = createPlaceSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });

    if (validation.data.imageUrls) {
      const invalid = validation.data.imageUrls.some((url) => !url.startsWith(session.userId + '/'));
      if (invalid) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });
    }

    const db = getDb(d1);
    const result = await createPlace(db, session.userId, {
      ...validation.data,
      description: validation.data.description ?? undefined,
      location: validation.data.location ?? undefined,
      city: validation.data.city ?? undefined,
      address: validation.data.address ?? undefined,
      contactPhone: validation.data.contactPhone ?? undefined,
      contactWhatsapp: validation.data.contactWhatsapp ?? undefined,
      website: validation.data.website ?? undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create place error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
