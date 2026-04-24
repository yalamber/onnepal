import { eq, asc, and } from 'drizzle-orm';
import { faqs } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getFaqs(db: Database, businessId: string) {
  return db
    .select()
    .from(faqs)
    .where(eq(faqs.businessId, businessId))
    .orderBy(asc(faqs.displayOrder));
}

export async function createFaq(
  db: Database,
  businessId: string,
  data: {
    question: string;
    answer: string;
  }
) {
  const id = generateId();
  const now = new Date();
  const existing = await getFaqs(db, businessId);

  await db.insert(faqs).values({
    id,
    businessId,
    question: data.question,
    answer: data.answer,
    displayOrder: existing.length,
    createdAt: now,
  });

  return { id };
}

export async function deleteFaq(db: Database, id: string, businessId: string) {
  await db
    .delete(faqs)
    .where(and(eq(faqs.id, id), eq(faqs.businessId, businessId)));
}
