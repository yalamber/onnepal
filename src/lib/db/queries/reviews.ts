import { eq, and, desc, avg, count } from 'drizzle-orm';
import { reviews } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getApprovedReviews(db: Database, businessId: string) {
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.businessId, businessId), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt));
}

export async function getAllReviews(db: Database, businessId: string) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.businessId, businessId))
    .orderBy(desc(reviews.createdAt));
}

export async function createReview(
  db: Database,
  businessId: string,
  data: {
    reviewerName: string;
    reviewerEmail?: string;
    rating: number;
    content?: string;
  }
) {
  const id = generateId();
  const now = new Date();

  await db.insert(reviews).values({
    id,
    businessId,
    reviewerName: data.reviewerName,
    reviewerEmail: data.reviewerEmail || null,
    rating: data.rating,
    content: data.content || null,
    isApproved: false,
    createdAt: now,
  });

  return { id };
}

export async function approveReview(db: Database, id: string, businessId: string) {
  await db
    .update(reviews)
    .set({ isApproved: true })
    .where(and(eq(reviews.id, id), eq(reviews.businessId, businessId)));
}

export async function deleteReview(db: Database, id: string, businessId: string) {
  await db.delete(reviews).where(and(eq(reviews.id, id), eq(reviews.businessId, businessId)));
}

export async function getAverageRating(db: Database, businessId: string) {
  const result = await db
    .select({
      average: avg(reviews.rating),
      count: count(),
    })
    .from(reviews)
    .where(and(eq(reviews.businessId, businessId), eq(reviews.isApproved, true)));

  const row = result[0];
  return {
    average: row?.average ? parseFloat(row.average) : 0,
    count: row?.count ?? 0,
  };
}
