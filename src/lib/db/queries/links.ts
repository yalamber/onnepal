import { eq, asc } from 'drizzle-orm';
import { socialLinks } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getSocialLinks(db: Database, userId: string) {
  return db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.userId, userId))
    .orderBy(asc(socialLinks.displayOrder));
}

export async function createSocialLink(
  db: Database,
  userId: string,
  data: {
    platform: string;
    url: string;
    label?: string;
  }
) {
  const id = generateId();
  // Get the next display order
  const existing = await getSocialLinks(db, userId);
  const nextOrder = existing.length;

  await db.insert(socialLinks).values({
    id,
    userId,
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
  _userId: string,
  data: Partial<{
    platform: string;
    url: string;
    label: string;
  }>
) {
  await db
    .update(socialLinks)
    .set(data as Partial<typeof socialLinks.$inferInsert>)
    .where(eq(socialLinks.id, id));
}

export async function deleteSocialLink(db: Database, id: string) {
  await db.delete(socialLinks).where(eq(socialLinks.id, id));
}

export async function reorderSocialLinks(db: Database, userId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(socialLinks)
      .set({ displayOrder: i })
      .where(eq(socialLinks.id, orderedIds[i]));
  }
}
