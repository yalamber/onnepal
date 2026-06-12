import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getNumbersFresh } from '@/lib/db/queries/daily';
import { bsToday } from '@/lib/bs-date';
import { getFestivalHint, countdownLabel } from '@/lib/festivals';

// "Nepal now" — the numbers strip: NRB forex, gold/silver, Kathmandu AQI +
// temperature, today's Bikram Sambat date, and the festival countdown.
// Serves the cached snapshot; refreshes inline when stale (>1h).

export async function GET() {
  try {
    const now = new Date();
    const db = getDb(getD1Database());
    const snap = await getNumbersFresh(db, now);
    const festival = getFestivalHint(now);

    return NextResponse.json(
      {
        bsDate: bsToday(now),
        adDate: now.toISOString().slice(0, 10),
        festival: festival
          ? {
              slug: festival.festival.slug,
              name: festival.festival.name,
              nepaliName: festival.festival.nepaliName,
              emoji: festival.festival.emoji,
              date: festival.festival.date,
              daysUntil: festival.daysUntil,
              isOngoing: festival.isOngoing,
              label: countdownLabel(festival),
            }
          : null,
        numbers: snap?.numbers ?? null,
        numbersFetchedAt: snap?.fetchedAt ?? null,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=600',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (err) {
    console.error('[api/nepal-now] failed', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
