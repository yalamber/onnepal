import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import { HeroRail } from './hero-rail';
import type { HomepageStats, ActivityItem } from '@/lib/db/queries/homepage';
import { relativeTime } from '@/lib/db/queries/homepage';

interface Props {
  stats: HomepageStats;
  activity: ActivityItem[];
}

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

const POPULAR_TAGS = [
  { label: 'Plumbers', href: '/pros?category=plumbers' },
  { label: '2BHK in Patan', href: '/classifieds?search=2BHK+Patan' },
  { label: 'Saturday hikes', href: '/events?search=hike' },
  { label: 'Trekking gear', href: '/classifieds?search=trekking' },
  { label: 'Maths tutor', href: '/pros?category=tutors' },
];

export function Hero({ stats, activity }: Props) {
  const wire = activity.map((a) => ({ ...a, time: relativeTime(a.createdAt) }));

  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="t-eyebrow hero-eyebrow">
            <span className="dot" /> Nepal&rsquo;s neighborhood platform
          </div>
          <h1 className="t-display hero-title">
            Everything <em>local.</em>
            <br />
            <span className="hero-title-2">One place to find it.</span>
          </h1>
          <p className="hero-lede">
            Businesses, classifieds, jobs, events &mdash; the daily pulse of your
            neighborhood, organized. From Thamel to Pokhara to your gully.
          </p>
          <form action="/search" method="GET" className="hero-search" role="search">
            <div className="hs-field">
              <span className="hs-icon"><Search size={18} /></span>
              <input name="q" placeholder="Search plumbers, flats, tutors, momo…" />
            </div>
            <div className="hs-field hs-loc">
              <span className="hs-icon"><MapPin size={18} /></span>
              <input name="loc" defaultValue="Kathmandu" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Search</button>
          </form>
          <div className="hero-tags">
            <span className="t-meta">Popular:</span>
            {POPULAR_TAGS.map((t) => (
              <Link key={t.label} className="tag" href={t.href}>{t.label}</Link>
            ))}
          </div>
        </div>

        <HeroRail initial={wire} />
      </div>

      <div className="hero-stats">
        <Stat n={fmt(stats.listings)} label="Listings live" />
        <Stat n={fmt(stats.businesses)} label="Verified businesses" />
        <Stat n={fmt(stats.eventsThisMonth)} label="Events this month" />
        <Stat n={fmt(stats.citiesCovered)} label="Cities covered" />
      </div>
    </section>
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
