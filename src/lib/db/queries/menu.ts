import { eq, asc, and } from 'drizzle-orm';
import { menuItems } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getMenuItems(db: Database, businessId: string) {
  return db
    .select()
    .from(menuItems)
    .where(eq(menuItems.businessId, businessId))
    .orderBy(asc(menuItems.category), asc(menuItems.displayOrder));
}

export async function getAvailableMenuItems(db: Database, businessId: string) {
  return db
    .select()
    .from(menuItems)
    .where(and(eq(menuItems.businessId, businessId), eq(menuItems.isAvailable, true)))
    .orderBy(asc(menuItems.category), asc(menuItems.displayOrder));
}

export async function createMenuItem(
  db: Database,
  businessId: string,
  data: {
    name: string;
    description?: string;
    price?: string;
    category?: string;
    imageKey?: string;
  }
) {
  const id = generateId();
  const now = new Date();
  const existing = await getMenuItems(db, businessId);

  await db.insert(menuItems).values({
    id,
    businessId,
    name: data.name,
    description: data.description || null,
    price: data.price || null,
    category: data.category || null,
    imageKey: data.imageKey || null,
    isAvailable: true,
    displayOrder: existing.length,
    createdAt: now,
    updatedAt: now,
  });

  return { id };
}

export async function updateMenuItem(
  db: Database,
  id: string,
  businessId: string,
  data: Partial<{
    name: string;
    description: string;
    price: string;
    category: string;
    imageKey: string;
    isAvailable: boolean;
  }>
) {
  await db
    .update(menuItems)
    .set({ ...data, updatedAt: new Date() } as Partial<typeof menuItems.$inferInsert>)
    .where(and(eq(menuItems.id, id), eq(menuItems.businessId, businessId)));
}

export async function deleteMenuItem(db: Database, id: string, businessId: string) {
  await db
    .delete(menuItems)
    .where(and(eq(menuItems.id, id), eq(menuItems.businessId, businessId)));
}
