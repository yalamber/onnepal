import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getHomepageStats, getRecentActivity, type HomepageStats, type ActivityItem } from '@/lib/db/queries/homepage';
import { getPublishedVoices, type VoiceListItem } from '@/lib/db/queries/voices';
import { getTodayDigest, type TodayDigest } from '@/lib/db/queries/today';
import { Hero } from '@/components/home/hero';
import { TodayCard } from '@/components/home/today-card';
import { CategoryGrid } from '@/components/home/category-grid';
import { Featured } from '@/components/home/featured';
import { Neighborhoods } from '@/components/home/neighborhoods';
import { BusinessPitch } from '@/components/home/business-pitch';
import { Community } from '@/components/home/community';
import { CityDetectPrompt } from '@/components/city-detect-prompt';

export const revalidate = 60;

const EMPTY_STATS: HomepageStats = {
  listings: 0, businesses: 0, eventsThisMonth: 0, citiesCovered: 0,
  byCategory: {
    directory: 0, classifieds: 0, jobs: 0, events: 0,
    places: 0, pros: 0, lostFound: 0, discussions: 0,
  },
};

export default async function HomePage() {
  const db = getDb(getD1Database());
  const [stats, activity, featuredVoices] = await Promise.all([
    getHomepageStats(db).catch((e) => { console.error('[home] getHomepageStats failed', e); return EMPTY_STATS; }),
    getRecentActivity(db, 5).catch((e) => { console.error('[home] getRecentActivity failed', e); return [] as ActivityItem[]; }),
    getPublishedVoices(db, { featuredOnly: true, limit: 4 })
      .then((items) => items.length >= 4 ? items : getPublishedVoices(db, { limit: 4 }))
      .catch((e) => { console.error('[home] getPublishedVoices(featured) failed', e); return [] as VoiceListItem[]; }),
  ]);

  const recentVoices = await getPublishedVoices(db, {
    excludeIds: featuredVoices.map((v) => v.id),
    limit: 3,
  }).catch((e) => { console.error('[home] getPublishedVoices(recent) failed', e); return [] as VoiceListItem[]; });

  // "Today in Nepal" daily digest. Global scope (no city) to match the rest
  // of the homepage, which doesn't read the city cookie server-side.
  const today: TodayDigest | null = await getTodayDigest(db, { now: new Date() })
    .catch((e) => { console.error('[home] getTodayDigest failed', e); return null; });

  return (
    <main>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-gray-950 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
      >
        Skip to content
      </a>
      <div id="main-content">
        <CityDetectPrompt />
        <Hero stats={stats} activity={activity} />
        {today && <TodayCard digest={today} />}
        <CategoryGrid counts={stats.byCategory} />
        <Featured voices={featuredVoices} />
        <Neighborhoods />
        <BusinessPitch />
        <Community voices={recentVoices} />
      </div>
    </main>
  );
}
