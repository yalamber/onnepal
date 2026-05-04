import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import {
  getHomepageStats,
  getRecentActivity,
  relativeTime,
  type HomepageStats,
  type ActivityItem,
} from '@/lib/db/queries/homepage';
import { getPublishedVoices, type VoiceListItem } from '@/lib/db/queries/voices';
import { cityFromSlug, slugFromCity } from '@/lib/helpers/city';
import { HeroRail } from '@/components/home/hero-rail';
import { CategoryGrid } from '@/components/home/category-grid';

interface Props { params: Promise<{ slug: string }> }

const KNOWN_CITIES = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan',
  'Biratnagar', 'Butwal', 'Janakpur', 'Dharan', 'Hetauda',
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = cityFromSlug(slug);
  return {
    title: `${city} — OnNepal`,
    description: `Everything happening in ${city}: classifieds, jobs, events, places, pros, lost & found, and voices.`,
  };
}

const EMPTY_STATS: HomepageStats = {
  listings: 0, businesses: 0, eventsThisMonth: 0, citiesCovered: 0,
  byCategory: {
    directory: 0, classifieds: 0, jobs: 0, events: 0,
    places: 0, pros: 0, lostFound: 0, discussions: 0,
  },
};

function fmt(n: number) { return n.toLocaleString('en-US'); }

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = cityFromSlug(slug);
  if (!city || city.length < 2) notFound();

  const db = getDb(getD1Database());
  const [stats, activity, voices] = await Promise.all([
    getHomepageStats(db, { city }).catch((e) => { console.error('[city] stats failed', e); return EMPTY_STATS; }),
    getRecentActivity(db, 5, city).catch((e) => { console.error('[city] activity failed', e); return [] as ActivityItem[]; }),
    getPublishedVoices(db, { city, limit: 3 }).catch((e) => { console.error('[city] voices failed', e); return [] as VoiceListItem[]; }),
  ]);

  // 404 guard: only treat known cities OR cities with any content as valid.
  const totalContent = stats.listings + stats.byCategory.directory + voices.length;
  const isKnownCity = KNOWN_CITIES.some((k) => k.toLowerCase() === city.toLowerCase());
  if (totalContent === 0 && !isKnownCity) {
    notFound();
  }

  const wire = activity.map((a) => ({ ...a, time: relativeTime(a.createdAt) }));

  // Per-category quick links — only show categories that have something
  const categoryStrips: Array<{ key: keyof HomepageStats['byCategory']; label: string; href: string; tone: string }> = [
    { key: 'classifieds', label: 'Classifieds', href: `/classifieds?city=${encodeURIComponent(city)}`, tone: 'crimson' },
    { key: 'jobs', label: 'Jobs', href: `/jobs?city=${encodeURIComponent(city)}`, tone: 'evergreen' },
    { key: 'events', label: 'Events', href: `/events?city=${encodeURIComponent(city)}`, tone: 'saffron' },
    { key: 'places', label: 'Places', href: `/places?city=${encodeURIComponent(city)}`, tone: 'teal' },
    { key: 'pros', label: 'Pros', href: `/pros?city=${encodeURIComponent(city)}`, tone: 'evergreen' },
    { key: 'lostFound', label: 'Lost & Found', href: `/lost-found?city=${encodeURIComponent(city)}`, tone: 'crimson' },
    { key: 'directory', label: 'Directory', href: `/directory?city=${encodeURIComponent(city)}`, tone: 'teal' },
  ];

  return (
    <main>
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="t-eyebrow hero-eyebrow">
              <span className="dot" /> Live · now in {city}
            </div>
            <h1 className="t-display hero-title">
              Everything in <em>{city}.</em>
            </h1>
            <p className="hero-lede">
              Listings, jobs, events, voices &mdash; the daily pulse of {city}, organized.
              Switch cities anytime from the pin in the header.
            </p>
            <form action="/search" method="GET" className="hero-search" role="search">
              <div className="hs-field">
                <span className="hs-icon"><Search size={18} /></span>
                <input name="q" placeholder={`Search in ${city}…`} />
              </div>
              <div className="hs-field hs-loc">
                <span className="hs-icon"><MapPin size={18} /></span>
                <input name="loc" defaultValue={city} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg">Search</button>
            </form>
          </div>

          <HeroRail initial={wire} city={city} />
        </div>

        <div className="hero-stats">
          <Stat n={fmt(stats.listings)} label="Listings live" />
          <Stat n={fmt(stats.byCategory.directory)} label="Verified businesses" />
          <Stat n={fmt(stats.eventsThisMonth)} label="Events this month" />
          <Stat n={fmt(voices.length)} label="Local voices" />
        </div>
      </section>

      <CategoryGrid
        counts={stats.byCategory}
        city={city}
        header={{
          eyebrow: `01 · In ${city}`,
          title: <>Browse <em>by category.</em></>,
          sub: `Each tile narrows to ${city} only. Switch cities from the header.`,
        }}
      />

      {voices.length > 0 && (
        <section className="section-paper">
          <div className="section-inner">
            <header className="sec-head">
              <div className="t-eyebrow">02 · Voices from {city}</div>
              <h2 className="t-display sec-title"><em>Local writing.</em></h2>
              <p className="sec-sub">Essays and guides written by people who live here. <Link href={`/voices?city=${encodeURIComponent(city)}`} className="text-[var(--accent)] underline underline-offset-4">All {city} voices →</Link></p>
            </header>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {voices.map((v) => (
                <li key={v.id}>
                  <Link href={`/voices/${v.slug}`} className="block">
                    {v.category && <span className="pill pill-saffron mb-3" style={{ display: 'inline-flex' }}>{v.category}</span>}
                    <h3 className="t-display mt-2" style={{ fontSize: 24, lineHeight: 1.2 }}>{v.title}</h3>
                    {v.excerpt && <p className="text-[var(--ink-700)] mt-2 line-clamp-3">{v.excerpt}</p>}
                    <div className="t-meta mt-3">
                      {v.authorName || v.authorUsername || 'Anonymous'}
                      {v.publishedAt ? ` · ${new Date(v.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section">
        <header className="sec-head">
          <div className="t-eyebrow">03 · Quick jumps</div>
          <h2 className="t-display sec-title">Open <em>any list, scoped to {city}.</em></h2>
          <p className="sec-sub">Direct links to each category, with the {city} filter pre-applied.</p>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categoryStrips.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              className="flex items-center justify-between p-4 rounded-[var(--r-md)] border border-[var(--ink-200)] bg-[var(--paper)] hover:border-[var(--ink-900)] transition-colors group"
            >
              <div>
                <div className="t-display" style={{ fontSize: 18 }}>{c.label}</div>
                <div className="t-meta mt-1">{fmt(stats.byCategory[c.key])} in {city}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--ink-300)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="stat">
      <div className="stat-n">{n}</div>
      <div className="t-meta">{label}</div>
    </div>
  );
}

// Suppress lint: slugFromCity is exported for type-check but used at link build sites
void slugFromCity;
