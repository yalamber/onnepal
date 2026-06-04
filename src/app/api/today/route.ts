import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getTodayDigest } from '@/lib/db/queries/today';
import { NEPAL_CITIES } from '@/lib/nepal-cities';

// JSON form of the "Today in Nepal" digest. Powers the homepage card's
// optional client refresh, future mobile/PWA surfaces, and a planned MCP
// tool (get_today_in_nepal). Cached 10 min at the CDN — the digest only
// changes meaningfully across the day.
//
// Optional ?city=<Name> scopes the digest. We validate against NEPAL_CITIES
// (proper-case match) so an arbitrary value can't be injected into queries
// beyond the parameterised COLLATE NOCASE comparison.

export async function GET(request: NextRequest) {
  const cityParam = request.nextUrl.searchParams.get('city');
  const city =
    cityParam && NEPAL_CITIES.some((c) => c.name.toLowerCase() === cityParam.toLowerCase())
      ? NEPAL_CITIES.find((c) => c.name.toLowerCase() === cityParam.toLowerCase())!.name
      : undefined;

  try {
    const db = getDb(getD1Database());
    const digest = await getTodayDigest(db, { now: new Date(), city });
    return NextResponse.json(digest, {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[/api/today] failed', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
