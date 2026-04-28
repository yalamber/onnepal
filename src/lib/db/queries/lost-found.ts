import { eq, and, desc, sql } from 'drizzle-orm';
import { lostFound, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

interface LostFoundFilters {
  type?: string;
  category?: string;
  search?: string;
  location?: string;
  page: number;
  limit: number;
}

export async function getLostFoundItems(
  db: Database,
  { type, category, search, location, page, limit }: LostFoundFilters
) {
  const conditions = [eq(lostFound.status, 'open')];

  if (type === 'lost' || type === 'found') {
    conditions.push(eq(lostFound.type, type));
  }
  if (category) {
    conditions.push(eq(lostFound.category, category));
  }
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${lostFound.title} LIKE ${pattern} COLLATE NOCASE OR ${lostFound.description} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) {
    conditions.push(sql`${lostFound.location} LIKE ${`%${location}%`} COLLATE NOCASE`);
  }

  const offset = (page - 1) * limit;

  return db
    .select({
      id: lostFound.id,
      type: lostFound.type,
      title: lostFound.title,
      description: lostFound.description,
      category: lostFound.category,
      location: lostFound.location,
      itemDate: lostFound.itemDate,
      reward: lostFound.reward,
      contactPhone: lostFound.contactPhone,
      contactWhatsapp: lostFound.contactWhatsapp,
      imageUrls: lostFound.imageUrls,
      status: lostFound.status,
      createdAt: lostFound.createdAt,
      userName: users.displayName,
    })
    .from(lostFound)
    .leftJoin(users, eq(lostFound.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(lostFound.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getLostFoundCount(
  db: Database,
  { type, category, search, location }: { type?: string; category?: string; search?: string; location?: string }
) {
  const conditions = [eq(lostFound.status, 'open')];
  if (type === 'lost' || type === 'found') conditions.push(eq(lostFound.type, type));
  if (category) conditions.push(eq(lostFound.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${lostFound.title} LIKE ${pattern} COLLATE NOCASE OR ${lostFound.description} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) {
    conditions.push(sql`${lostFound.location} LIKE ${`%${location}%`} COLLATE NOCASE`);
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(lostFound)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

export async function getLostFoundById(db: Database, id: string) {
  const result = await db
    .select({
      id: lostFound.id,
      userId: lostFound.userId,
      type: lostFound.type,
      title: lostFound.title,
      description: lostFound.description,
      category: lostFound.category,
      location: lostFound.location,
      itemDate: lostFound.itemDate,
      reward: lostFound.reward,
      contactPhone: lostFound.contactPhone,
      contactWhatsapp: lostFound.contactWhatsapp,
      imageUrls: lostFound.imageUrls,
      status: lostFound.status,
      createdAt: lostFound.createdAt,
      userName: users.displayName,
    })
    .from(lostFound)
    .leftJoin(users, eq(lostFound.userId, users.id))
    .where(eq(lostFound.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createLostFoundItem(
  db: Database,
  userId: string,
  data: {
    type: 'lost' | 'found';
    title: string;
    description?: string;
    category: string;
    location?: string;
    itemDate?: string;
    reward?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    imageUrls?: string[];
  }
) {
  const id = generateId();
  const now = new Date();

  await db.insert(lostFound).values({
    id,
    userId,
    type: data.type,
    title: data.title,
    description: data.description || null,
    category: data.category,
    location: data.location || null,
    itemDate: data.itemDate || null,
    reward: data.reward || null,
    contactPhone: data.contactPhone || null,
    contactWhatsapp: data.contactWhatsapp || null,
    imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : null,
    status: 'open',
    createdAt: now,
    updatedAt: now,
  });

  return { id };
}

export async function deleteLostFoundItem(db: Database, id: string, userId: string) {
  await db.delete(lostFound).where(and(eq(lostFound.id, id), eq(lostFound.userId, userId)));
}

export async function resolveLostFoundItem(db: Database, id: string, userId: string) {
  await db.update(lostFound)
    .set({ status: 'resolved', updatedAt: new Date() })
    .where(and(eq(lostFound.id, id), eq(lostFound.userId, userId)));
}
