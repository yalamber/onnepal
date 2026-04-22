import { eq, and, desc, sql } from 'drizzle-orm';
import { classifieds, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

interface ClassifiedFilters {
  category?: string;
  search?: string;
  location?: string;
  page: number;
  limit: number;
}

export async function getClassifieds(
  db: Database,
  { category, search, location, page, limit }: ClassifiedFilters
) {
  const conditions = [eq(classifieds.status, 'active')];

  if (category) {
    conditions.push(eq(classifieds.category, category));
  }
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${classifieds.title} LIKE ${pattern} COLLATE NOCASE OR ${classifieds.description} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) {
    const pattern = `%${location}%`;
    conditions.push(sql`${classifieds.location} LIKE ${pattern} COLLATE NOCASE`);
  }

  const offset = (page - 1) * limit;

  return db
    .select({
      id: classifieds.id,
      title: classifieds.title,
      description: classifieds.description,
      price: classifieds.price,
      category: classifieds.category,
      location: classifieds.location,
      contactPhone: classifieds.contactPhone,
      contactWhatsapp: classifieds.contactWhatsapp,
      imageUrls: classifieds.imageUrls,
      status: classifieds.status,
      createdAt: classifieds.createdAt,
      userName: users.businessName,
      userSubdomain: users.subdomain,
    })
    .from(classifieds)
    .leftJoin(users, eq(classifieds.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(classifieds.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getClassifiedsCount(
  db: Database,
  { category, search, location }: { category?: string; search?: string; location?: string }
) {
  const conditions = [eq(classifieds.status, 'active')];
  if (category) conditions.push(eq(classifieds.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${classifieds.title} LIKE ${pattern} COLLATE NOCASE OR ${classifieds.description} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) {
    conditions.push(sql`${classifieds.location} LIKE ${`%${location}%`} COLLATE NOCASE`);
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(classifieds)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

export async function getClassifiedById(db: Database, id: string) {
  const result = await db
    .select({
      id: classifieds.id,
      userId: classifieds.userId,
      title: classifieds.title,
      description: classifieds.description,
      price: classifieds.price,
      category: classifieds.category,
      location: classifieds.location,
      contactPhone: classifieds.contactPhone,
      contactWhatsapp: classifieds.contactWhatsapp,
      imageUrls: classifieds.imageUrls,
      status: classifieds.status,
      createdAt: classifieds.createdAt,
      userName: users.businessName,
      userSubdomain: users.subdomain,
    })
    .from(classifieds)
    .leftJoin(users, eq(classifieds.userId, users.id))
    .where(eq(classifieds.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getUserClassifieds(db: Database, userId: string) {
  return db
    .select()
    .from(classifieds)
    .where(eq(classifieds.userId, userId))
    .orderBy(desc(classifieds.createdAt));
}

export async function createClassified(
  db: Database,
  userId: string,
  data: {
    title: string;
    description?: string;
    price?: string;
    category: string;
    location?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    imageUrls?: string[];
  }
) {
  const id = generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(classifieds).values({
    id,
    userId,
    title: data.title,
    description: data.description || null,
    price: data.price || null,
    category: data.category,
    location: data.location || null,
    contactPhone: data.contactPhone || null,
    contactWhatsapp: data.contactWhatsapp || null,
    imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    expiresAt,
  });

  return { id };
}

export async function deleteClassified(db: Database, id: string, userId: string) {
  await db.delete(classifieds).where(and(eq(classifieds.id, id), eq(classifieds.userId, userId)));
}

export async function getClassifiedCategories(db: Database) {
  const results = await db
    .select({
      category: classifieds.category,
      count: sql<number>`count(*)`,
    })
    .from(classifieds)
    .where(eq(classifieds.status, 'active'))
    .groupBy(classifieds.category)
    .orderBy(sql`count(*) DESC`);

  return results;
}
