import { eq, asc, and } from 'drizzle-orm';
import { galleryImages } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getGalleryImages(db: Database, businessId: string) {
  return db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.businessId, businessId))
    .orderBy(asc(galleryImages.displayOrder));
}

export async function addGalleryImage(
  db: Database,
  businessId: string,
  data: {
    imageKey: string;
    caption?: string;
  }
) {
  const id = generateId();
  const now = new Date();
  const existing = await getGalleryImages(db, businessId);

  await db.insert(galleryImages).values({
    id,
    businessId,
    imageKey: data.imageKey,
    caption: data.caption || null,
    displayOrder: existing.length,
    createdAt: now,
  });

  return { id };
}

export async function deleteGalleryImage(db: Database, id: string, businessId: string) {
  await db
    .delete(galleryImages)
    .where(and(eq(galleryImages.id, id), eq(galleryImages.businessId, businessId)));
}
