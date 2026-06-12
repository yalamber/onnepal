import { sql, eq, desc, inArray, notInArray, and } from 'drizzle-orm';
import { newsItems, dataSnapshots } from '../schema';
import type { Database } from '../index';
import { NEWS_SOURCES, type NewsSource } from '@/lib/news-sources';
import { parseFeed } from '@/lib/rss';
import { fetchNepalNumbers, type NepalNumbers } from '@/lib/nepal-data';

/**
 * Daily-hub data layer: refresh pipelines (called by the cron route and by
 * stale-while-revalidate fallbacks) + read queries for the homepage/API.
 */

export interface NewsItem {
  link: string;
  source: string;
  sourceName: string;
  lang: 'en' | 'np';
  title: string;
  excerpt: string | null;
  category: string | null;
  publishedAt: number; // ms
}

const NEWS_STALE_SECONDS = 20 * 60;      // refresh feeds if oldest fetch > 20 min
const NUMBERS_STALE_SECONDS = 60 * 60;   // refresh numbers if snapshot > 1 h
const NEWS_RETENTION_DAYS = 7;
const PER_SOURCE_KEEP = 25;              // cap stored items per source per fetch

function toMs(v: Date | number): number {
  return v instanceof Date ? v.getTime() : Number(v);
}

// ---- News ------------------------------------------------------------------

type NewsRow = Omit<NewsItem, 'publishedAt'> & { publishedAt: Date };

async function fetchOneFeed(src: NewsSource): Promise<NewsRow[]> {
  const res = await fetch(src.feedUrl, {
    signal: AbortSignal.timeout(8000),
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OnNepalBot/1.0; +https://onnepal.com)' },
  });
  if (!res.ok) throw new Error(`${src.id} ${res.status}`);
  const xml = await res.text();
  const items = parseFeed(xml);
  const now = new Date();
  return items.slice(0, PER_SOURCE_KEEP).map((it) => ({
    link: it.link,
    source: src.id,
    sourceName: src.name,
    lang: src.lang,
    title: it.title,
    excerpt: it.excerpt,
    category: it.category,
    publishedAt: it.publishedAt ?? now,
  }));
}

/**
 * Fetch all feeds (allSettled — one dead portal never blocks the rest),
 * upsert by link, prune old rows. Returns per-source counts for logging.
 */
export async function refreshNews(db: Database): Promise<Record<string, number | string>> {
  const results = await Promise.allSettled(NEWS_SOURCES.map((s) => fetchOneFeed(s)));
  const report: Record<string, number | string> = {};
  const now = new Date();

  for (let i = 0; i < NEWS_SOURCES.length; i++) {
    const src = NEWS_SOURCES[i];
    const r = results[i];
    if (r.status === 'rejected') {
      report[src.id] = `error: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`;
      continue;
    }
    const rows = r.value;
    report[src.id] = rows.length;
    // Chunked upsert: D1 caps bound params at 100 per statement, and each
    // row binds 9 — so max 11 rows per insert; we use 10 for headroom.
    // onConflictDoUpdate keeps titles/excerpts fresh if the portal edits
    // a story after publishing.
    const CHUNK = 10;
    for (let c = 0; c < rows.length; c += CHUNK) {
      await db
        .insert(newsItems)
        .values(rows.slice(c, c + CHUNK).map((row) => ({ ...row, fetchedAt: now })))
        .onConflictDoUpdate({
          target: newsItems.link,
          set: {
            title: sql`excluded.title`,
            excerpt: sql`excluded.excerpt`,
            category: sql`excluded.category`,
            fetchedAt: sql`excluded.fetched_at`,
          },
        });
    }
  }

  // Prune: anything older than retention, plus items from sources we dropped.
  const cutoff = Math.floor(now.getTime() / 1000) - NEWS_RETENTION_DAYS * 86_400;
  await db.run(sql`DELETE FROM news_items WHERE published_at < ${cutoff}`);
  const activeIds = NEWS_SOURCES.map((s) => s.id);
  await db.delete(newsItems).where(notInArray(newsItems.source, activeIds));

  return report;
}

export async function getNews(
  db: Database,
  opts: { lang?: 'en' | 'np'; sources?: string[]; limit?: number } = {},
): Promise<NewsItem[]> {
  const { lang, sources, limit = 30 } = opts;
  const conditions = [];
  if (lang) conditions.push(eq(newsItems.lang, lang));
  if (sources?.length) conditions.push(inArray(newsItems.source, sources));

  const rows = await db
    .select()
    .from(newsItems)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(newsItems.publishedAt))
    .limit(Math.min(limit, 100));

  return rows.map((r) => ({
    link: r.link,
    source: r.source,
    sourceName: r.sourceName,
    lang: r.lang,
    title: r.title,
    excerpt: r.excerpt,
    category: r.category,
    publishedAt: toMs(r.publishedAt),
  }));
}

/** Oldest-fetch age check — drives SWR refresh on /api/news. */
export async function newsIsStale(db: Database): Promise<boolean> {
  const rows = await db
    .select({ latest: sql<number>`max(fetched_at)` })
    .from(newsItems);
  const latest = Number(rows[0]?.latest ?? 0);
  return Math.floor(Date.now() / 1000) - latest > NEWS_STALE_SECONDS;
}

// ---- Numbers snapshot --------------------------------------------------------

export interface NumbersSnapshot {
  numbers: NepalNumbers;
  fetchedAt: number; // ms
}

const NUMBERS_KEY = 'nepal-now';

export async function refreshNumbers(db: Database, now: Date): Promise<NumbersSnapshot> {
  const numbers = await fetchNepalNumbers(now);
  const snapshot: NumbersSnapshot = { numbers, fetchedAt: now.getTime() };

  // Don't clobber a good snapshot with an all-null one (every upstream down).
  const allNull = !numbers.forex && !numbers.gold && !numbers.kathmandu;
  if (!allNull) {
    await db
      .insert(dataSnapshots)
      .values({ key: NUMBERS_KEY, payload: JSON.stringify(numbers), fetchedAt: now })
      .onConflictDoUpdate({
        target: dataSnapshots.key,
        set: { payload: sql`excluded.payload`, fetchedAt: sql`excluded.fetched_at` },
      });
  }
  return snapshot;
}

export async function getNumbers(db: Database): Promise<NumbersSnapshot | null> {
  const rows = await db.select().from(dataSnapshots).where(eq(dataSnapshots.key, NUMBERS_KEY)).limit(1);
  const r = rows[0];
  if (!r) return null;
  try {
    return { numbers: JSON.parse(r.payload) as NepalNumbers, fetchedAt: toMs(r.fetchedAt) };
  } catch {
    return null;
  }
}

export function numbersAreStale(snap: NumbersSnapshot | null): boolean {
  if (!snap) return true;
  return Date.now() - snap.fetchedAt > NUMBERS_STALE_SECONDS * 1000;
}

/**
 * Read numbers with stale-while-revalidate semantics: serve the snapshot if
 * fresh; refresh inline when stale/missing (a couple of fast API calls).
 */
export async function getNumbersFresh(db: Database, now: Date): Promise<NumbersSnapshot | null> {
  const snap = await getNumbers(db);
  if (!numbersAreStale(snap)) return snap;
  try {
    const fresh = await refreshNumbers(db, now);
    const allNull = !fresh.numbers.forex && !fresh.numbers.gold && !fresh.numbers.kathmandu;
    return allNull ? snap : fresh; // stale beats empty
  } catch (err) {
    console.error('[daily] numbers refresh failed, serving stale', err);
    return snap;
  }
}
