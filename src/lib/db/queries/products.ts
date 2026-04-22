import { eq, asc, and } from 'drizzle-orm';
import { products } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getProducts(db: Database, businessId: string) {
  return db
    .select()
    .from(products)
    .where(eq(products.businessId, businessId))
    .orderBy(asc(products.displayOrder));
}

export async function getAvailableProducts(db: Database, businessId: string) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.businessId, businessId), eq(products.isAvailable, true)))
    .orderBy(asc(products.displayOrder));
}

export async function createProduct(
  db: Database,
  businessId: string,
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
  const existing = await getProducts(db, businessId);

  await db.insert(products).values({
    id,
    businessId,
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
  businessId: string,
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
    .where(and(eq(products.id, id), eq(products.businessId, businessId)));
}

export async function deleteProduct(db: Database, id: string, businessId?: string) {
  const conditions = [eq(products.id, id)];
  if (businessId) conditions.push(eq(products.businessId, businessId));
  await db.delete(products).where(and(...conditions));
}

export async function reorderProducts(db: Database, businessId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(products)
      .set({ displayOrder: i })
      .where(and(eq(products.id, orderedIds[i]), eq(products.businessId, businessId)));
  }
}
