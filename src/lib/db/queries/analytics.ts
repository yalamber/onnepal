import { eq, and, gte, sql } from 'drizzle-orm';
import { pageViews } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function recordPageView(
  db: Database,
  businessId: string,
  referrer?: string
) {
  const id = generateId();
  await db.insert(pageViews).values({
    id,
    businessId,
    referrer: referrer || null,
    viewedAt: new Date(),
  });
}

export async function getPageViewCount(
  db: Database,
  businessId: string,
  since?: Date
) {
  const conditions = [eq(pageViews.businessId, businessId)];
  if (since) {
    conditions.push(gte(pageViews.viewedAt, since));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageViews)
    .where(and(...conditions));

  return result[0]?.count || 0;
}

export async function getPageViewStats(db: Database, businessId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalViews, weekViews, monthViews] = await Promise.all([
    getPageViewCount(db, businessId),
    getPageViewCount(db, businessId, weekAgo),
    getPageViewCount(db, businessId, monthAgo),
  ]);

  return { totalViews, weekViews, monthViews };
}
