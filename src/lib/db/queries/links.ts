import { eq, asc, and } from 'drizzle-orm';
import { socialLinks } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getSocialLinks(db: Database, businessId: string) {
  return db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.businessId, businessId))
    .orderBy(asc(socialLinks.displayOrder));
}

export async function createSocialLink(
  db: Database,
  businessId: string,
  data: {
    platform: string;
    url: string;
    label?: string;
  }
) {
  const id = generateId();
  const existing = await getSocialLinks(db, businessId);
  const nextOrder = existing.length;

  await db.insert(socialLinks).values({
    id,
    businessId,
    platform: data.platform as typeof socialLinks.$inferInsert['platform'],
    url: data.url,
    label: data.label || null,
    displayOrder: nextOrder,
    createdAt: new Date(),
  });

  return { id };
}

export async function updateSocialLink(
  db: Database,
  id: string,
  businessId: string,
  data: Partial<{
    platform: string;
    url: string;
    label: string;
  }>
) {
  await db
    .update(socialLinks)
    .set(data as Partial<typeof socialLinks.$inferInsert>)
    .where(and(eq(socialLinks.id, id), eq(socialLinks.businessId, businessId)));
}

export async function deleteSocialLink(db: Database, id: string, businessId?: string) {
  const conditions = [eq(socialLinks.id, id)];
  if (businessId) conditions.push(eq(socialLinks.businessId, businessId));
  await db.delete(socialLinks).where(and(...conditions));
}

export async function reorderSocialLinks(db: Database, businessId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(socialLinks)
      .set({ displayOrder: i })
      .where(and(eq(socialLinks.id, orderedIds[i]), eq(socialLinks.businessId, businessId)));
  }
}
