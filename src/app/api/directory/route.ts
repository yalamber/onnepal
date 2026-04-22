import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import {
  getPublishedBusinesses,
  getPublishedBusinessCount,
  getCategories,
} from '@/lib/db/queries/directory';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    const d1 = await getD1Database();
    const db = getDb(d1);

    const [businesses, total, categories] = await Promise.all([
      getPublishedBusinesses(db, { category, search, page, limit }),
      getPublishedBusinessCount(db, { category, search }),
      getCategories(db),
    ]);

    return NextResponse.json({
      businesses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories,
    });
  } catch (error) {
    console.error('Directory API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
