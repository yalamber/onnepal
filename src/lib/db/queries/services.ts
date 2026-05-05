import { eq, and, desc, sql } from 'drizzle-orm';
import { services, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

interface ServiceFilters {
  category?: string;
  search?: string;
  city?: string;
  page: number;
  limit: number;
}

export async function getServices(db: Database, { category, search, city, page, limit }: ServiceFilters) {
  const conditions: ReturnType<typeof eq>[] = [eq(services.status, 'active')];

  if (category) conditions.push(eq(services.category, category));
  if (city) conditions.push(eq(services.city, city));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${services.title} LIKE ${pattern} COLLATE NOCASE OR ${services.description} LIKE ${pattern} COLLATE NOCASE)` as any
    );
  }

  const offset = (page - 1) * limit;
  return db
    .select({
      id: services.id,
      userId: services.userId,
      title: services.title,
      description: services.description,
      category: services.category,
      location: services.location,
      priceType: services.priceType,
      price: services.price,
      contactPhone: services.contactPhone,
      contactWhatsapp: services.contactWhatsapp,
      imageUrls: services.imageUrls,
      createdAt: services.createdAt,
      userName: users.displayName,
    })
    .from(services)
    .leftJoin(users, eq(services.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(services.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getServicesCount(db: Database, { category, search, city }: { category?: string; search?: string; city?: string }) {
  const conditions: ReturnType<typeof eq>[] = [eq(services.status, 'active')];
  if (category) conditions.push(eq(services.category, category));
  if (city) conditions.push(eq(services.city, city));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${services.title} LIKE ${pattern} COLLATE NOCASE OR ${services.description} LIKE ${pattern} COLLATE NOCASE)` as any
    );
  }
  const result = await db.select({ count: sql<number>`count(*)` }).from(services).where(and(...conditions));
  return result[0]?.count ?? 0;
}

export async function getServiceById(db: Database, id: string) {
  const result = await db
    .select({
      id: services.id,
      userId: services.userId,
      title: services.title,
      description: services.description,
      category: services.category,
      location: services.location,
      priceType: services.priceType,
      price: services.price,
      contactPhone: services.contactPhone,
      contactWhatsapp: services.contactWhatsapp,
      imageUrls: services.imageUrls,
      status: services.status,
      createdAt: services.createdAt,
      userName: users.displayName,
    })
    .from(services)
    .leftJoin(users, eq(services.userId, users.id))
    .where(eq(services.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createService(
  db: Database,
  userId: string,
  data: {
    title: string;
    description?: string | null;
    category: string;
    location?: string | null;
    city?: string | null;
    priceType?: string | null;
    price?: string | null;
    contactPhone?: string | null;
    contactWhatsapp?: string | null;
    imageUrls?: string;
  }
) {
  const id = generateId();
  const now = new Date();
  await db.insert(services).values({
    id,
    userId,
    title: data.title,
    description: data.description || null,
    category: data.category,
    location: data.location || null,
    city: data.city || null,
    priceType: data.priceType || null,
    price: data.price || null,
    contactPhone: data.contactPhone || null,
    contactWhatsapp: data.contactWhatsapp || null,
    imageUrls: data.imageUrls || null,
    createdAt: now,
    updatedAt: now,
  });
  return { id };
}

export async function deleteService(db: Database, id: string, userId: string) {
  await db.delete(services).where(and(eq(services.id, id), eq(services.userId, userId)));
}
