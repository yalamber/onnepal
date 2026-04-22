import { eq, asc, and } from 'drizzle-orm';
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
  userId: string,
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
    .where(and(eq(products.id, id), eq(products.userId, userId)));
}

export async function deleteProduct(db: Database, id: string, userId?: string) {
  const conditions = [eq(products.id, id)];
  if (userId) conditions.push(eq(products.userId, userId));
  await db.delete(products).where(and(...conditions));
}

export async function reorderProducts(db: Database, userId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(products)
      .set({ displayOrder: i })
      .where(and(eq(products.id, orderedIds[i]), eq(products.userId, userId)));
  }
}
