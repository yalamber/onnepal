import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getClassifieds, getClassifiedsCount, getClassifiedCategories, createClassified } from '@/lib/db/queries/classifieds';
import { getSession } from '@/lib/auth/session';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';
import { createClassifiedSchema } from '@/lib/validators/listings';
import { resolveCity } from '@/lib/helpers/city';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const location = searchParams.get('location') || undefined;
    const city = await resolveCity(request, searchParams.get('city'));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    const d1 = getD1Database();
    const db = getDb(d1);

    const [listings, total, categories] = await Promise.all([
      getClassifieds(db, { category, search, location, city, page, limit }),
      getClassifiedsCount(db, { category, search, location, city }),
      getClassifiedCategories(db),
    ]);

    const res = NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories,
    });
    res.headers.set('Cache-Control', 'public, s-maxage=300');
    return res;
  } catch (error) {
    console.error('Classifieds API error:', error);
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
    const rl = await checkRateLimit(d1, 'classified:create', session.userId, 10, 86400);
    if (!rl.allowed) return tooManyRequests(86400);

    const body = await request.json();
    const validation = createClassifiedSchema.safeParse(body);
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

    const result = await createClassified(db, session.userId, validation.data);

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create classified error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
