import { sql } from 'drizzle-orm';
import { classifieds, jobs, events, places, lostFound } from '../schema';
import type { Database } from '../index';
import { NEPAL_CITIES } from '@/lib/nepal-cities';

export interface CityCount {
  name: string;
  slug: string;
  count: number;
}

/**
 * Returns every city we know about (NEPAL_CITIES) annotated with a total
 * "live content" count summed across classifieds + jobs + events + places +
 * lost-found. Cheap: 5 GROUP BY queries, all in parallel.
 *
 * Cities not in NEPAL_CITIES are dropped — we don't surface unknown city
 * strings stored in user-submitted listings as if they were real cities.
 */
export async function getCitiesWithCounts(db: Database): Promise<CityCount[]> {
  const counts = new Map<string, number>();
  const accept = (rows: Array<{ city: string | null; c: number }>) => {
    for (const r of rows) {
      if (!r.city) continue;
      const k = r.city.trim().toLowerCase();
      if (!k) continue;
      counts.set(k, (counts.get(k) ?? 0) + Number(r.c));
    }
  };

  const [c, j, e, p, l] = await Promise.all([
    db
      .select({ city: classifieds.city, c: sql<number>`count(*)` })
      .from(classifieds)
      .where(sql`${classifieds.status} = 'active'`)
      .groupBy(classifieds.city),
    db
      .select({ city: jobs.city, c: sql<number>`count(*)` })
      .from(jobs)
      .where(sql`${jobs.status} = 'open'`)
      .groupBy(jobs.city),
    db
      .select({ city: events.city, c: sql<number>`count(*)` })
      .from(events)
      .where(sql`${events.status} IN ('upcoming','ongoing')`)
      .groupBy(events.city),
    db
      .select({ city: places.city, c: sql<number>`count(*)` })
      .from(places)
      .where(sql`${places.status} = 'active'`)
      .groupBy(places.city),
    db
      .select({ city: lostFound.city, c: sql<number>`count(*)` })
      .from(lostFound)
      .where(sql`${lostFound.status} = 'open'`)
      .groupBy(lostFound.city),
  ]);
  accept(c); accept(j); accept(e); accept(p); accept(l);

  return NEPAL_CITIES.map((city) => ({
    name: city.name,
    slug: city.slug,
    count: counts.get(city.name.toLowerCase()) ?? 0,
  }));
}

/**
 * Top N cities by content count. Used by the nav picker's empty state to
 * show data-driven popular cities instead of editorial copy.
 *
 * Ties are broken by NEPAL_CITIES order (Kathmandu, Pokhara, Lalitpur, …)
 * which roughly approximates population.
 */
export async function getTopCitiesByContent(db: Database, limit = 8): Promise<CityCount[]> {
  const all = await getCitiesWithCounts(db);
  return [...all]
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return NEPAL_CITIES.findIndex((c) => c.name === a.name) - NEPAL_CITIES.findIndex((c) => c.name === b.name);
    })
    .slice(0, limit);
}
