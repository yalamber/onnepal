import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getTopCitiesByContent } from '@/lib/db/queries/cities';

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') ?? '8', 10)));
    const db = getDb(getD1Database());
    const cities = await getTopCitiesByContent(db, limit);
    const res = NextResponse.json({ cities });
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
    return res;
  } catch (err) {
    console.error('[api/cities] failed', err);
    return NextResponse.json({ cities: [] });
  }
}
