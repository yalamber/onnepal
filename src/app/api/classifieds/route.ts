import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getClassifieds, getClassifiedsCount, getClassifiedCategories, createClassified } from '@/lib/db/queries/classifieds';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const createClassifiedSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  price: z.string().max(50).optional(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().max(200).optional(),
  contactPhone: z.string().max(20).optional(),
  contactWhatsapp: z.string().max(20).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const location = searchParams.get('location') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    const d1 = await getD1Database();
    const db = getDb(d1);

    const [listings, total, categories] = await Promise.all([
      getClassifieds(db, { category, search, location, page, limit }),
      getClassifiedsCount(db, { category, search, location }),
      getClassifiedCategories(db),
    ]);

    return NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories,
    });
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

    const body = await request.json();
    const validation = createClassifiedSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const d1 = await getD1Database();
    const db = getDb(d1);

    const result = await createClassified(db, session.userId, validation.data);

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create classified error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
