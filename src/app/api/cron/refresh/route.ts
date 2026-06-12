import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getJwtSecret } from '@/lib/cloudflare';
import { refreshNews, refreshNumbers } from '@/lib/db/queries/daily';

// Internal refresh endpoint, invoked by the worker's `scheduled` handler
// (see worker/index.ts) via an in-process synthetic request. Guarded by the
// JWT_SECRET — external callers can't trigger upstream fetch storms.
//
// Constant-time-ish comparison isn't critical here (the secret is long and
// random, and a failed guess costs the attacker a 401), but don't log it.

export async function POST(request: NextRequest) {
  const provided = request.headers.get('x-cron-secret');
  let expected: string;
  try {
    expected = getJwtSecret();
  } catch {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  const db = getDb(getD1Database());
  const now = new Date();

  const [newsResult, numbersResult] = await Promise.allSettled([
    refreshNews(db),
    refreshNumbers(db, now),
  ]);

  const summary = {
    tookMs: Date.now() - startedAt,
    news: newsResult.status === 'fulfilled' ? newsResult.value : `error: ${String(newsResult.reason)}`,
    numbers:
      numbersResult.status === 'fulfilled'
        ? {
            forex: !!numbersResult.value.numbers.forex,
            gold: !!numbersResult.value.numbers.gold,
            kathmandu: !!numbersResult.value.numbers.kathmandu,
          }
        : `error: ${String(numbersResult.reason)}`,
  };
  console.log('[cron/refresh]', JSON.stringify(summary));
  return NextResponse.json(summary);
}
