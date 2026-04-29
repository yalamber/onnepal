import { eq, and, desc, sql } from 'drizzle-orm';
import { places, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

interface PlaceFilters {
  category?: string;
  search?: string;
  location?: string;
  city?: string;
  page: number;
  limit: number;
}

export async function getPlaces(
  db: Database,
  { category, search, location, city, page, limit }: PlaceFilters
) {
  const conditions = [
    eq(places.status, 'active'),
  ];

  if (category) conditions.push(eq(places.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${places.title} LIKE ${pattern} COLLATE NOCASE OR ${places.description} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) {
    conditions.push(sql`${places.location} LIKE ${`%${location}%`} COLLATE NOCASE`);
  }
  if (city) {
    conditions.push(eq(places.city, city));
  }

  const offset = (page - 1) * limit;

  return db
    .select({
      id: places.id,
      title: places.title,
      description: places.description,
      category: places.category,
      location: places.location,
      city: places.city,
      address: places.address,
      imageUrls: places.imageUrls,
      contactPhone: places.contactPhone,
      contactWhatsapp: places.contactWhatsapp,
      website: places.website,
      status: places.status,
      createdAt: places.createdAt,
      userName: users.displayName,
    })
    .from(places)
    .leftJoin(users, eq(places.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(places.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPlacesCount(
  db: Database,
  { category, search, location, city }: { category?: string; search?: string; location?: string; city?: string }
) {
  const conditions = [eq(places.status, 'active')];
  if (category) conditions.push(eq(places.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${places.title} LIKE ${pattern} COLLATE NOCASE OR ${places.description} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) conditions.push(sql`${places.location} LIKE ${`%${location}%`} COLLATE NOCASE`);
  if (city) conditions.push(eq(places.city, city));

  const result = await db.select({ count: sql<number>`count(*)` }).from(places).where(and(...conditions));
  return result[0]?.count ?? 0;
}

export async function getPlaceById(db: Database, id: string) {
  const result = await db
    .select({
      id: places.id,
      userId: places.userId,
      title: places.title,
      description: places.description,
      category: places.category,
      location: places.location,
      city: places.city,
      address: places.address,
      imageUrls: places.imageUrls,
      contactPhone: places.contactPhone,
      contactWhatsapp: places.contactWhatsapp,
      website: places.website,
      status: places.status,
      createdAt: places.createdAt,
      userName: users.displayName,
    })
    .from(places)
    .leftJoin(users, eq(places.userId, users.id))
    .where(eq(places.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createPlace(
  db: Database,
  userId: string,
  data: {
    title: string;
    description?: string;
    category: string;
    location?: string;
    city?: string;
    address?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    website?: string;
    imageUrls?: string[];
  }
) {
  const id = generateId();
  const now = new Date();

  await db.insert(places).values({
    id,
    userId,
    title: data.title,
    description: data.description || null,
    category: data.category,
    location: data.location || null,
    city: data.city || null,
    address: data.address || null,
    contactPhone: data.contactPhone || null,
    contactWhatsapp: data.contactWhatsapp || null,
    website: data.website || null,
    imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
  return { id };
}

export async function deletePlace(db: Database, id: string, userId: string) {
  await db.delete(places).where(and(eq(places.id, id), eq(places.userId, userId)));
}

interface UpdatePlaceData {
  title?: string;
  description?: string | null;
  category?: string;
  location?: string | null;
  city?: string | null;
  address?: string | null;
  imageUrls?: string[] | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  website?: string | null;
  status?: string;
}

export async function updatePlace(
  db: Database, id: string, userId: string,
  data: UpdatePlaceData
) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.category !== undefined) updates.category = data.category;
  if (data.location !== undefined) updates.location = data.location;
  if (data.city !== undefined) updates.city = data.city;
  if (data.address !== undefined) updates.address = data.address;
  if (data.contactPhone !== undefined) updates.contactPhone = data.contactPhone;
  if (data.contactWhatsapp !== undefined) updates.contactWhatsapp = data.contactWhatsapp;
  if (data.website !== undefined) updates.website = data.website;
  if (data.imageUrls !== undefined) updates.imageUrls = data.imageUrls ? JSON.stringify(data.imageUrls) : null;
  if (data.status !== undefined) updates.status = data.status;

  await db.update(places).set(updates).where(and(eq(places.id, id), eq(places.userId, userId)));
}
