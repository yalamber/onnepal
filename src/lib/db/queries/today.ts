import { sql, eq, desc } from 'drizzle-orm';
import { classifieds, events, lostFound, voices, users } from '../schema';
import type { Database } from '../index';
import { getFestivalHint, kathmanduDayIso, type FestivalHint } from '@/lib/festivals';

/**
 * "Today in Nepal" — the daily homepage digest. Assembles a small,
 * citation-ready snapshot from content the platform already produces:
 *  - the next/ongoing festival (from the static panchang in lib/festivals)
 *  - the freshest published Voice (featured preferred)
 *  - how many listings went up in the last 24h + the hottest classifieds category
 *  - the soonest upcoming event
 *  - a recent open lost-item to nudge a good deed
 *
 * Everything is one cheap query batch. The homepage already revalidates
 * every 60s, and we add an explicit `generatedAt` so the card can show a
 * "refreshes daily" affordance.
 */

export interface TodayVoice {
  slug: string;
  title: string;
  excerpt: string | null;
  city: string | null;
  category: string | null;
  authorName: string | null;
}

export interface TodayEvent {
  id: string;
  title: string;
  city: string | null;
  venue: string | null;
  startDate: string;
  daysUntil: number | null;
}

export interface TodayLostItem {
  id: string;
  title: string;
  city: string | null;
  type: 'lost' | 'found';
}

export interface TodayDigest {
  generatedAt: number;        // ms
  dateLabel: string;          // "Thursday, May 14"
  festival: FestivalHint | null;
  voice: TodayVoice | null;
  newListings24h: number;
  hotCategory: string | null;
  nextEvent: TodayEvent | null;
  lostItem: TodayLostItem | null;
  city?: string;              // echo back the scope, if any
}

function daysBetween(fromIso: string, to: Date): number | null {
  // events.startDate is 'YYYY-MM-DD'. Return whole days from `to` to that date.
  if (!/^\d{4}-\d{2}-\d{2}/.test(fromIso)) return null;
  const [y, m, d] = fromIso.slice(0, 10).split('-').map(Number);
  const target = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  const today = Math.floor(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()) / 86_400_000);
  return target - today;
}

export async function getTodayDigest(
  db: Database,
  opts: { now: Date; city?: string },
): Promise<TodayDigest> {
  const { now, city } = opts;

  // 24h / 7d cutoffs for "new" counters. createdAt is `mode: 'timestamp'`,
  // which SQLite stores as SECONDS. When we hand-write the comparison in a
  // raw `sql` template the D1 driver binds the value as-is (no Date coercion,
  // unlike drizzle's typed `gte(col, date)` helper), so we MUST pass a
  // seconds-epoch integer — a Date object throws D1_TYPE_ERROR.
  const cutoff24h = Math.floor((now.getTime() - 24 * 60 * 60 * 1000) / 1000);
  const cutoff7d = Math.floor((now.getTime() - 7 * 24 * 60 * 60 * 1000) / 1000);
  const todayIso = kathmanduDayIso(now); // KTM civil day for events.startDate compare

  const cityEq = (col: ReturnType<typeof sql>) =>
    city ? sql` AND ${col} = ${city} COLLATE NOCASE` : sql``;

  const [voiceRows, newCountRows, hotCatRows, eventRows, lostRows] = await Promise.all([
    // Freshest published voice — featured first, then most recent.
    db
      .select({
        slug: voices.slug,
        title: voices.title,
        excerpt: voices.excerpt,
        city: voices.city,
        category: voices.category,
        authorName: users.displayName,
        authorUsername: users.username,
      })
      .from(voices)
      .leftJoin(users, eq(voices.userId, users.id))
      .where(
        city
          ? sql`${voices.status} = 'published' AND ${voices.city} = ${city} COLLATE NOCASE`
          : eq(voices.status, 'published'),
      )
      .orderBy(desc(voices.isFeatured), desc(voices.publishedAt))
      .limit(1),

    // New listings in the last 24h across classifieds + events + lost-found.
    db
      .select({ c: sql<number>`count(*)` })
      .from(classifieds)
      .where(sql`${classifieds.status} = 'active' AND ${classifieds.createdAt} >= ${cutoff24h}${cityEq(sql`${classifieds.city}`)}`),

    // Hottest classifieds category in the last 24h (fallback: last 7d).
    db
      .select({ category: classifieds.category, c: sql<number>`count(*)` })
      .from(classifieds)
      .where(
        sql`${classifieds.status} = 'active' AND ${classifieds.createdAt} >= ${cutoff7d}${cityEq(sql`${classifieds.city}`)}`,
      )
      .groupBy(classifieds.category)
      .orderBy(desc(sql`count(*)`))
      .limit(1),

    // Soonest *genuinely upcoming* event. Filter startDate >= today so stale
    // rows that still carry status='upcoming' but have a past date don't get
    // surfaced as "Today". startDate is TEXT 'YYYY-MM-DD', so a string compare
    // is a correct date compare.
    db
      .select({
        id: events.id,
        title: events.title,
        city: events.city,
        venue: events.venue,
        startDate: events.startDate,
      })
      .from(events)
      .where(
        sql`(${events.status} = 'upcoming' OR ${events.status} = 'ongoing') AND ${events.startDate} >= ${todayIso}${cityEq(sql`${events.city}`)}`,
      )
      .orderBy(events.startDate)
      .limit(1),

    // A recent open lost item (not found — "lost" pulls at the heartstrings
    // and is the one most in need of eyeballs).
    db
      .select({ id: lostFound.id, title: lostFound.title, city: lostFound.city, type: lostFound.type })
      .from(lostFound)
      .where(
        city
          ? sql`${lostFound.status} = 'open' AND ${lostFound.type} = 'lost' AND ${lostFound.city} = ${city} COLLATE NOCASE`
          : sql`${lostFound.status} = 'open' AND ${lostFound.type} = 'lost'`,
      )
      .orderBy(desc(lostFound.createdAt))
      .limit(1),
  ]);

  const v = voiceRows[0];
  const ev = eventRows[0];
  const lost = lostRows[0];

  return {
    generatedAt: now.getTime(),
    dateLabel: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    festival: getFestivalHint(now),
    voice: v
      ? {
          slug: v.slug,
          title: v.title,
          excerpt: v.excerpt,
          city: v.city,
          category: v.category,
          authorName: v.authorName || v.authorUsername || null,
        }
      : null,
    newListings24h: Number(newCountRows[0]?.c ?? 0),
    hotCategory: hotCatRows[0]?.category ?? null,
    nextEvent: ev
      ? {
          id: ev.id,
          title: ev.title,
          city: ev.city,
          venue: ev.venue,
          startDate: ev.startDate,
          daysUntil: daysBetween(ev.startDate, now),
        }
      : null,
    lostItem: lost ? { id: lost.id, title: lost.title, city: lost.city, type: lost.type } : null,
    city,
  };
}

// Re-exported for consumers that only import from this module.
export type { FestivalHint };
