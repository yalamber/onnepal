import { eq, asc } from 'drizzle-orm';
import { ctaButtons } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getCtaButtons(db: Database, userId: string) {
  return db
    .select()
    .from(ctaButtons)
    .where(eq(ctaButtons.userId, userId))
    .orderBy(asc(ctaButtons.displayOrder));
}

export async function createCtaButton(
  db: Database,
  userId: string,
  data: {
    label: string;
    url: string;
    style?: string;
  }
) {
  const id = generateId();
  const existing = await getCtaButtons(db, userId);

  await db.insert(ctaButtons).values({
    id,
    userId,
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
  data: Partial<{
    label: string;
    url: string;
    style: string;
  }>
) {
  await db
    .update(ctaButtons)
    .set(data as Partial<typeof ctaButtons.$inferInsert>)
    .where(eq(ctaButtons.id, id));
}

export async function deleteCtaButton(db: Database, id: string) {
  await db.delete(ctaButtons).where(eq(ctaButtons.id, id));
}

export async function reorderCtaButtons(db: Database, userId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(ctaButtons)
      .set({ displayOrder: i })
      .where(eq(ctaButtons.id, orderedIds[i]));
  }
}
