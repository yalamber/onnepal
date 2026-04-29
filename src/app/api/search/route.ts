import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { searchAll } from '@/lib/db/queries/search';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q');
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const db = getDb(getD1Database());
    const results = await searchAll(db, q.trim());

    const res = NextResponse.json(results);
    res.headers.set('Cache-Control', 'public, s-maxage=60');
    return res;
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
