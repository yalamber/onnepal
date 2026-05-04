import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getRecentActivity, relativeTime } from '@/lib/db/queries/homepage';
import { resolveCity } from '@/lib/helpers/city';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    // explicit ?city= overrides the cookie; "any" disables city scope entirely.
    const explicit = sp.get('city');
    const city = explicit === 'any' ? undefined : await resolveCity(request, explicit);

    const db = getDb(getD1Database());
    const items = await getRecentActivity(db, 5, city);
    const response = NextResponse.json({
      items: items.map((i) => ({ ...i, time: relativeTime(i.createdAt) })),
      city: city ?? null,
    });
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('[api/activity/recent] failed', error);
    return NextResponse.json({ items: [] });
  }
}
