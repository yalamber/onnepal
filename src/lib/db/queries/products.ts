import { eq, asc } from 'drizzle-orm';
import { products } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getProducts(db: Database, userId: string) {
  return db
    .select()
    .from(products)
    .where(eq(products.userId, userId))
    .orderBy(asc(products.displayOrder));
}

export async function getAvailableProducts(db: Database, userId: string) {
  return db
    .select()
    .from(products)
    .where(eq(products.userId, userId))
    .orderBy(asc(products.displayOrder));
}

export async function createProduct(
  db: Database,
  userId: string,
  data: {
    name: string;
    description?: string;
    price?: string;
    imageUrl?: string;
    category?: string;
    isAvailable?: boolean;
  }
) {
  const id = generateId();
  const now = new Date();
  const existing = await getProducts(db, userId);

  await db.insert(products).values({
    id,
    userId,
    name: data.name,
    description: data.description || null,
    price: data.price || null,
    imageUrl: data.imageUrl || null,
    category: data.category || null,
    isAvailable: data.isAvailable ?? true,
    displayOrder: existing.length,
    createdAt: now,
    updatedAt: now,
  });

  return { id };
}

export async function updateProduct(
  db: Database,
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    category: string;
    isAvailable: boolean;
  }>
) {
  await db
    .update(products)
    .set({ ...data, updatedAt: new Date() } as Partial<typeof products.$inferInsert>)
    .where(eq(products.id, id));
}

export async function deleteProduct(db: Database, id: string) {
  await db.delete(products).where(eq(products.id, id));
}

export async function reorderProducts(db: Database, userId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(products)
      .set({ displayOrder: i })
      .where(eq(products.id, orderedIds[i]));
  }
}
