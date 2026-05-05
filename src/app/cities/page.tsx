import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from 'drizzle-orm';
import { ArrowRight } from 'lucide-react';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { classifieds, jobs, events, places, lostFound } from '@/lib/db/schema';
import { NEPAL_CITIES } from '@/lib/nepal-cities';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Cities — OnNepal',
  description: 'Browse OnNepal by city. Every Nepal city we cover, with current listings, jobs, events, and businesses.',
};

const POPULAR = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Biratnagar', 'Butwal', 'Janakpur'];

interface CityRow {
  name: string;
  slug: string;
  count: number;
  popular: boolean;
}

async function getCityCounts(): Promise<Map<string, number>> {
  // Single GROUP BY per table → cheap. We tally totals across types so the
  // count reflects "how much is happening here" without distinguishing kind.
  const counts = new Map<string, number>();
  const accept = (rows: Array<{ city: string | null; c: number }>) => {
    for (const r of rows) {
      if (!r.city) continue;
      const k = r.city.trim().toLowerCase();
      if (!k) continue;
      counts.set(k, (counts.get(k) ?? 0) + Number(r.c));
    }
  };

  try {
    const db = getDb(getD1Database());
    const [c, j, e, p, l] = await Promise.all([
      db.select({ city: classifieds.city, c: sql<number>`count(*)` }).from(classifieds).where(sql`${classifieds.status} = 'active'`).groupBy(classifieds.city),
      db.select({ city: jobs.city, c: sql<number>`count(*)` }).from(jobs).where(sql`${jobs.status} = 'open'`).groupBy(jobs.city),
      db.select({ city: events.city, c: sql<number>`count(*)` }).from(events).where(sql`${events.status} IN ('upcoming','ongoing')`).groupBy(events.city),
      db.select({ city: places.city, c: sql<number>`count(*)` }).from(places).where(sql`${places.status} = 'active'`).groupBy(places.city),
      db.select({ city: lostFound.city, c: sql<number>`count(*)` }).from(lostFound).where(sql`${lostFound.status} = 'open'`).groupBy(lostFound.city),
    ]);
    accept(c); accept(j); accept(e); accept(p); accept(l);
  } catch (err) {
    console.error('[/cities] count query failed', err);
  }

  return counts;
}

export default async function CitiesPage() {
  const counts = await getCityCounts();
  const popularSet = new Set(POPULAR.map((s) => s.toLowerCase()));

  const rows: CityRow[] = NEPAL_CITIES.map((c) => ({
    name: c.name,
    slug: c.slug,
    count: counts.get(c.name.toLowerCase()) ?? 0,
    popular: popularSet.has(c.name.toLowerCase()),
  }));

  // Show popular block in fixed order, then everything else alphabetical.
  const popularRows = POPULAR
    .map((name) => rows.find((r) => r.name === name))
    .filter((r): r is CityRow => Boolean(r));
  const otherRows = rows
    .filter((r) => !r.popular)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Group "other" cities alphabetically by first letter for scannable browsing.
  const buckets = new Map<string, CityRow[]>();
  for (const r of otherRows) {
    const letter = r.name.charAt(0).toUpperCase();
    if (!buckets.has(letter)) buckets.set(letter, []);
    buckets.get(letter)!.push(r);
  }
  const letters = Array.from(buckets.keys()).sort();

  return (
    <main>
      <div className="page-hero">
        <div className="t-eyebrow"><span className="dot" /> {rows.length} cities · across Nepal</div>
        <h1 className="page-hero-title">Every <em>city,</em> mapped.</h1>
        <p className="page-hero-sub">
          Pick a city to see everything happening there &mdash; classifieds, jobs, events,
          businesses, voices. We add a city the moment its first listing goes up.
        </p>
      </div>

      <div className="page-shell pb-24">
        {/* Popular cities — bigger cards */}
        <section>
          <div className="t-eyebrow mb-4">Popular</div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularRows.map((c) => (
              <li key={c.slug}>
                <Link href={`/city/${c.slug}`} className="city-card">
                  <div className="city-top">
                    <span className="city-name">{c.name}</span>
                    <span className="city-arrow"><ArrowRight size={18} /></span>
                  </div>
                  <div className="city-stats">
                    <div><strong>{c.count.toLocaleString('en-US')}</strong><span> listings</span></div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Alphabetical buckets — compact text rows */}
        <section className="mt-12">
          <div className="t-eyebrow mb-4">All cities</div>
          <div className="space-y-8">
            {letters.map((letter) => (
              <div key={letter}>
                <h2
                  className="t-display mb-3"
                  style={{ fontSize: 28, lineHeight: 1, color: 'var(--ink-300)' }}
                >
                  {letter}
                </h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
                  {buckets.get(letter)!.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/city/${c.slug}`}
                        className="flex items-baseline justify-between py-1.5 border-b border-[var(--ink-100)] hover:border-[var(--ink-900)] transition-colors"
                      >
                        <span className="text-[var(--ink-900)]">{c.name}</span>
                        <span className="t-meta">{c.count > 0 ? c.count.toLocaleString('en-US') : '—'}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
