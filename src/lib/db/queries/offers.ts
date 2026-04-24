import { eq, and, desc, gt, or, isNull } from 'drizzle-orm';
import { specialOffers } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getActiveOffers(db: Database, businessId: string) {
  const now = new Date();
  return db
    .select()
    .from(specialOffers)
    .where(
      and(
        eq(specialOffers.businessId, businessId),
        eq(specialOffers.isActive, true),
        or(isNull(specialOffers.expiresAt), gt(specialOffers.expiresAt, now))
      )
    )
    .orderBy(desc(specialOffers.createdAt));
}

export async function getAllOffers(db: Database, businessId: string) {
  return db
    .select()
    .from(specialOffers)
    .where(eq(specialOffers.businessId, businessId))
    .orderBy(desc(specialOffers.createdAt));
}

export async function createOffer(
  db: Database,
  businessId: string,
  data: {
    title: string;
    description?: string;
    discountText?: string;
    code?: string;
    startsAt?: string;
    expiresAt?: string;
  }
) {
  const id = generateId();
  const now = new Date();

  await db.insert(specialOffers).values({
    id,
    businessId,
    title: data.title,
    description: data.description || null,
    discountText: data.discountText || null,
    code: data.code || null,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    isActive: true,
    createdAt: now,
  });

  return { id };
}

export async function deleteOffer(db: Database, id: string, businessId: string) {
  await db
    .delete(specialOffers)
    .where(and(eq(specialOffers.id, id), eq(specialOffers.businessId, businessId)));
}
