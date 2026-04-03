import { eq, and, gte, sql } from 'drizzle-orm';
import { pageViews } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function recordPageView(
  db: Database,
  userId: string,
  referrer?: string
) {
  const id = generateId();
  await db.insert(pageViews).values({
    id,
    userId,
    referrer: referrer || null,
    viewedAt: new Date(),
  });
}

export async function getPageViewCount(
  db: Database,
  userId: string,
  since?: Date
) {
  const conditions = [eq(pageViews.userId, userId)];
  if (since) {
    conditions.push(gte(pageViews.viewedAt, since));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageViews)
    .where(and(...conditions));

  return result[0]?.count || 0;
}

export async function getPageViewStats(db: Database, userId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalViews, weekViews, monthViews] = await Promise.all([
    getPageViewCount(db, userId),
    getPageViewCount(db, userId, weekAgo),
    getPageViewCount(db, userId, monthAgo),
  ]);

  return { totalViews, weekViews, monthViews };
}
