import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getLostFoundItems, getLostFoundCount, createLostFoundItem } from '@/lib/db/queries/lost-found';
import { getSession } from '@/lib/auth/session';
import { createLostFoundSchema } from '@/lib/validators/listings';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const location = searchParams.get('location') || undefined;
    const district = searchParams.get('district') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    const d1 = getD1Database();
    const db = getDb(d1);

    const [items, total] = await Promise.all([
      getLostFoundItems(db, { type, category, search, location, district, page, limit }),
      getLostFoundCount(db, { type, category, search, location, district }),
    ]);

    const res = NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
    res.headers.set('Cache-Control', 'public, s-maxage=300');
    return res;
  } catch (error) {
    console.error('Lost & Found API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d1 = getD1Database();
    const rl = await checkRateLimit(d1, 'lost-found:create', session.userId, 5, 86400);
    if (!rl.allowed) return tooManyRequests(86400);

    const body = await request.json();
    const validation = createLostFoundSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    if (validation.data.imageUrls) {
      const invalid = validation.data.imageUrls.some((url) => !url.startsWith(session.userId + '/'));
      if (invalid) {
        return NextResponse.json({ error: 'Invalid image' }, { status: 400 });
      }
    }

    const db = getDb(d1);

    const result = await createLostFoundItem(db, session.userId, {
      ...validation.data,
      description: validation.data.description ?? undefined,
      location: validation.data.location ?? undefined,
      itemDate: validation.data.itemDate ?? undefined,
      reward: validation.data.reward ?? undefined,
      contactPhone: validation.data.contactPhone ?? undefined,
      contactWhatsapp: validation.data.contactWhatsapp ?? undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create lost-found error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
