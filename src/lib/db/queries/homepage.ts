import { sql, eq, desc, and, gte, or } from 'drizzle-orm';
import {
  businesses,
  classifieds,
  jobs,
  events,
  places,
  services,
  lostFound,
  discussions,
} from '../schema';
import type { Database } from '../index';

export type CategoryKey =
  | 'directory' | 'classifieds' | 'jobs' | 'events'
  | 'places' | 'pros' | 'lostFound' | 'discussions';

export interface HomepageStats {
  listings: number;
  businesses: number;
  eventsThisMonth: number;
  citiesCovered: number;
  byCategory: Record<CategoryKey, number>;
}

export type ActivityType = 'classifieds' | 'jobs' | 'events' | 'lost-found' | 'pros';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  meta: string;
  createdAt: number; // ms
}

async function countWhere(promise: Promise<{ c: number }[]>): Promise<number> {
  const rows = await promise;
  return Number(rows[0]?.c ?? 0);
}

export async function getHomepageStats(db: Database): Promise<HomepageStats> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthDate = startOfMonth.toISOString().slice(0, 10); // 'YYYY-MM-DD' for events.startDate

  const [
    publishedBusinesses,
    activeClassifieds,
    openJobs,
    upcomingEvents,
    activePlaces,
    activeServices,
    openLostFound,
    allDiscussions,
    eventsThisMonthCount,
    distinctCities,
  ] = await Promise.all([
    countWhere(db.select({ c: sql<number>`count(*)` }).from(businesses).where(eq(businesses.isPublished, true))),
    countWhere(db.select({ c: sql<number>`count(*)` }).from(classifieds).where(eq(classifieds.status, 'active'))),
    countWhere(db.select({ c: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, 'open'))),
    countWhere(db.select({ c: sql<number>`count(*)` }).from(events).where(or(eq(events.status, 'upcoming'), eq(events.status, 'ongoing')))),
    countWhere(db.select({ c: sql<number>`count(*)` }).from(places).where(eq(places.status, 'active'))),
    countWhere(db.select({ c: sql<number>`count(*)` }).from(services).where(eq(services.status, 'active'))),
    countWhere(db.select({ c: sql<number>`count(*)` }).from(lostFound).where(eq(lostFound.status, 'open'))),
    countWhere(db.select({ c: sql<number>`count(*)` }).from(discussions)),
    countWhere(
      db.select({ c: sql<number>`count(*)` }).from(events).where(
        and(
          or(eq(events.status, 'upcoming'), eq(events.status, 'ongoing')),
          gte(events.startDate, startOfMonthDate),
        ),
      ),
    ),
    countWhere(
      db.select({ c: sql<number>`count(distinct ${places.city})` }).from(places).where(
        and(eq(places.status, 'active'), sql`${places.city} is not null and ${places.city} != ''`),
      ),
    ),
  ]);

  const listings = activeClassifieds + openJobs + upcomingEvents + activePlaces + activeServices + openLostFound;

  return {
    listings,
    businesses: publishedBusinesses,
    eventsThisMonth: eventsThisMonthCount,
    citiesCovered: distinctCities,
    byCategory: {
      directory: publishedBusinesses,
      classifieds: activeClassifieds,
      jobs: openJobs,
      events: upcomingEvents,
      places: activePlaces,
      pros: activeServices,
      lostFound: openLostFound,
      discussions: allDiscussions,
    },
  };
}

export async function getRecentActivity(db: Database, limit = 5): Promise<ActivityItem[]> {
  const [c, j, e, l, s] = await Promise.all([
    db
      .select({ id: classifieds.id, title: classifieds.title, price: classifieds.price, city: classifieds.city, location: classifieds.location, createdAt: classifieds.createdAt })
      .from(classifieds)
      .where(eq(classifieds.status, 'active'))
      .orderBy(desc(classifieds.createdAt))
      .limit(limit),
    db
      .select({ id: jobs.id, title: jobs.title, company: jobs.company, type: jobs.type, location: jobs.location, city: jobs.city, createdAt: jobs.createdAt })
      .from(jobs)
      .where(eq(jobs.status, 'open'))
      .orderBy(desc(jobs.createdAt))
      .limit(limit),
    db
      .select({ id: events.id, title: events.title, venue: events.venue, city: events.city, startDate: events.startDate, createdAt: events.createdAt })
      .from(events)
      .where(or(eq(events.status, 'upcoming'), eq(events.status, 'ongoing')))
      .orderBy(desc(events.createdAt))
      .limit(limit),
    db
      .select({ id: lostFound.id, title: lostFound.title, type: lostFound.type, city: lostFound.city, location: lostFound.location, createdAt: lostFound.createdAt })
      .from(lostFound)
      .where(eq(lostFound.status, 'open'))
      .orderBy(desc(lostFound.createdAt))
      .limit(limit),
    db
      .select({ id: services.id, title: services.title, location: services.location, price: services.price, createdAt: services.createdAt })
      .from(services)
      .where(eq(services.status, 'active'))
      .orderBy(desc(services.createdAt))
      .limit(limit),
  ]);

  const items: ActivityItem[] = [
    ...c.map((r) => ({
      id: r.id,
      type: 'classifieds' as const,
      title: r.title,
      meta: [r.city || r.location, r.price ? `Rs ${r.price}` : null].filter(Boolean).join(' · '),
      createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : Number(r.createdAt),
    })),
    ...j.map((r) => ({
      id: r.id,
      type: 'jobs' as const,
      title: r.title,
      meta: [r.company, r.city || r.location].filter(Boolean).join(' · '),
      createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : Number(r.createdAt),
    })),
    ...e.map((r) => ({
      id: r.id,
      type: 'events' as const,
      title: r.title,
      meta: [r.venue, r.city, r.startDate].filter(Boolean).join(' · '),
      createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : Number(r.createdAt),
    })),
    ...l.map((r) => ({
      id: r.id,
      type: 'lost-found' as const,
      title: r.title,
      meta: [r.type === 'found' ? 'Found' : 'Lost', r.city || r.location].filter(Boolean).join(' · '),
      createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : Number(r.createdAt),
    })),
    ...s.map((r) => ({
      id: r.id,
      type: 'pros' as const,
      title: r.title,
      meta: [r.location, r.price].filter(Boolean).join(' · '),
      createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : Number(r.createdAt),
    })),
  ];

  return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function relativeTime(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
