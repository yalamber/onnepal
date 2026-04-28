import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

  let businessPages: Array<{ url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }> = [];
  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const published = await db.select({ subdomain: businesses.subdomain, updatedAt: businesses.updatedAt })
      .from(businesses).where(eq(businesses.isPublished, true));
    businessPages = published.map(b => ({
      url: `https://${b.subdomain}.onnepal.com`,
      lastModified: b.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {}

  return [...staticPages, ...businessPages];
}
