import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getNews, newsIsStale, refreshNews } from '@/lib/db/queries/daily';
import { NEWS_SOURCES } from '@/lib/news-sources';

// Aggregated Nepali news headlines (title + excerpt + outbound link).
// ?lang=en|np  ?source=<id>(,<id>)  ?limit=<n>
//
// SWR: if the freshest fetch is older than the staleness window (e.g. cron
// missed a beat, or local dev with no cron), refresh inline before serving.
// Cron normally keeps this hot so the inline path is the exception.

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lang = sp.get('lang') === 'en' ? 'en' : sp.get('lang') === 'np' ? 'np' : undefined;
  const sourceParam = sp.get('source');
  const sources = sourceParam
    ? sourceParam.split(',').filter((s) => NEWS_SOURCES.some((n) => n.id === s))
    : undefined;
  const limit = Math.max(1, Math.min(Number(sp.get('limit')) || 30, 100));

  try {
    const db = getDb(getD1Database());

    if (await newsIsStale(db)) {
      try {
        const report = await refreshNews(db);
        console.log('[api/news] inline refresh', report);
      } catch (err) {
        console.error('[api/news] inline refresh failed, serving stale', err);
      }
    }

    const items = await getNews(db, { lang, sources, limit });
    return NextResponse.json(
      { items, sources: NEWS_SOURCES.map(({ id, name, lang: l, homepage }) => ({ id, name, lang: l, homepage })) },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (err) {
    console.error('[api/news] failed', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
