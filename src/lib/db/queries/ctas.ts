import { eq, asc, and } from 'drizzle-orm';
import { ctaButtons } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getCtaButtons(db: Database, businessId: string) {
  return db
    .select()
    .from(ctaButtons)
    .where(eq(ctaButtons.businessId, businessId))
    .orderBy(asc(ctaButtons.displayOrder));
}

export async function createCtaButton(
  db: Database,
  businessId: string,
  data: {
    label: string;
    url: string;
    style?: string;
  }
) {
  const id = generateId();
  const existing = await getCtaButtons(db, businessId);

  await db.insert(ctaButtons).values({
    id,
    businessId,
    label: data.label,
    url: data.url,
    style: (data.style as typeof ctaButtons.$inferInsert['style']) || 'primary',
    displayOrder: existing.length,
    createdAt: new Date(),
  });

  return { id };
}

export async function updateCtaButton(
  db: Database,
  id: string,
  businessId: string,
  data: Partial<{
    label: string;
    url: string;
    style: string;
  }>
) {
  await db
    .update(ctaButtons)
    .set(data as Partial<typeof ctaButtons.$inferInsert>)
    .where(and(eq(ctaButtons.id, id), eq(ctaButtons.businessId, businessId)));
}

export async function deleteCtaButton(db: Database, id: string, businessId?: string) {
  const conditions = [eq(ctaButtons.id, id)];
  if (businessId) conditions.push(eq(ctaButtons.businessId, businessId));
  await db.delete(ctaButtons).where(and(...conditions));
}

export async function reorderCtaButtons(db: Database, businessId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(ctaButtons)
      .set({ displayOrder: i })
      .where(and(eq(ctaButtons.id, orderedIds[i]), eq(ctaButtons.businessId, businessId)));
  }
}
