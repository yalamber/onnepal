import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getRecentActivity, relativeTime } from '@/lib/db/queries/homepage';

export async function GET() {
  try {
    const db = getDb(getD1Database());
    const items = await getRecentActivity(db, 5);
    const response = NextResponse.json({
      items: items.map((i) => ({ ...i, time: relativeTime(i.createdAt) })),
    });
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('[api/activity/recent] failed', error);
    return NextResponse.json({ items: [] });
  }
}
