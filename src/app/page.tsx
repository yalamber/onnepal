import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getHomepageStats, getRecentActivity, type HomepageStats, type ActivityItem } from '@/lib/db/queries/homepage';
import { Hero } from '@/components/home/hero';
import { CategoryGrid } from '@/components/home/category-grid';
import { Featured } from '@/components/home/featured';
import { Neighborhoods } from '@/components/home/neighborhoods';
import { BusinessPitch } from '@/components/home/business-pitch';
import { Community } from '@/components/home/community';

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
  const [stats, activity] = await Promise.all([
    getHomepageStats(db).catch((e) => { console.error('[home] getHomepageStats failed', e); return EMPTY_STATS; }),
    getRecentActivity(db, 5).catch((e) => { console.error('[home] getRecentActivity failed', e); return [] as ActivityItem[]; }),
  ]);

  return (
    <main>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-gray-950 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
      >
        Skip to content
      </a>
      <div id="main-content">
        <Hero stats={stats} activity={activity} />
        <CategoryGrid counts={stats.byCategory} />
        <Featured />
        <Neighborhoods />
        <BusinessPitch />
        <Community />
      </div>
    </main>
  );
}
