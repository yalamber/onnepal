import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { businesses, classifieds, jobs, events, lostFound, places } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function sitemap() {
  const staticPages = [
    { url: 'https://onnepal.com', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: 'https://onnepal.com/directory', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: 'https://onnepal.com/classifieds', lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: 'https://onnepal.com/jobs', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: 'https://onnepal.com/events', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: 'https://onnepal.com/lost-found', lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.7 },
    { url: 'https://onnepal.com/login', changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: 'https://onnepal.com/signup', changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  const dynamicPages: Array<{ url: string; lastModified: Date; changeFrequency: 'daily' | 'weekly'; priority: number }> = [];

  try {
    const d1 = getD1Database();
    const db = getDb(d1);

    const [publishedBusinesses, activeClassifieds, openJobs, upcomingEvents, activeLostFound] = await Promise.all([
      db.select({ subdomain: businesses.subdomain, updatedAt: businesses.updatedAt })
        .from(businesses).where(eq(businesses.isPublished, true)),
      db.select({ id: classifieds.id, updatedAt: classifieds.updatedAt })
        .from(classifieds).where(eq(classifieds.status, 'active')).orderBy(desc(classifieds.createdAt)).limit(500),
      db.select({ id: jobs.id, updatedAt: jobs.updatedAt })
        .from(jobs).where(eq(jobs.status, 'open')).orderBy(desc(jobs.createdAt)).limit(500),
      db.select({ id: events.id, updatedAt: events.updatedAt })
        .from(events).where(eq(events.status, 'upcoming')).orderBy(desc(events.createdAt)).limit(500),
      db.select({ id: lostFound.id, updatedAt: lostFound.updatedAt })
        .from(lostFound).where(eq(lostFound.status, 'open')).orderBy(desc(lostFound.createdAt)).limit(500),
    ]);

    for (const b of publishedBusinesses) {
      dynamicPages.push({ url: `https://${b.subdomain}.onnepal.com`, lastModified: b.updatedAt, changeFrequency: 'weekly', priority: 0.7 });
    }
    for (const c of activeClassifieds) {
      dynamicPages.push({ url: `https://onnepal.com/classifieds/post/${c.id}`, lastModified: c.updatedAt, changeFrequency: 'daily', priority: 0.6 });
    }
    for (const j of openJobs) {
      dynamicPages.push({ url: `https://onnepal.com/jobs/${j.id}`, lastModified: j.updatedAt, changeFrequency: 'daily', priority: 0.6 });
    }
    for (const e of upcomingEvents) {
      dynamicPages.push({ url: `https://onnepal.com/events/${e.id}`, lastModified: e.updatedAt, changeFrequency: 'daily', priority: 0.6 });
    }
    for (const l of activeLostFound) {
      dynamicPages.push({ url: `https://onnepal.com/lost-found/post/${l.id}`, lastModified: l.updatedAt, changeFrequency: 'daily', priority: 0.5 });
    }
  } catch {}

  return [...staticPages, ...dynamicPages];
}
