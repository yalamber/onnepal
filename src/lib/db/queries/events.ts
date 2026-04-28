import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { events, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

interface EventFilters {
  category?: string;
  search?: string;
  location?: string;
  page: number;
  limit: number;
}

export async function getEvents(
  db: Database,
  { category, search, location, page, limit }: EventFilters
) {
  const conditions = [
    sql`${events.status} IN ('upcoming', 'ongoing')`,
  ];

  if (category) conditions.push(eq(events.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${events.title} LIKE ${pattern} COLLATE NOCASE OR ${events.description} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) {
    conditions.push(sql`${events.location} LIKE ${`%${location}%`} COLLATE NOCASE`);
  }

  const offset = (page - 1) * limit;

  return db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      category: events.category,
      startDate: events.startDate,
      endDate: events.endDate,
      startTime: events.startTime,
      endTime: events.endTime,
      venue: events.venue,
      location: events.location,
      ticketPrice: events.ticketPrice,
      imageUrls: events.imageUrls,
      status: events.status,
      createdAt: events.createdAt,
      userName: users.displayName,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(and(...conditions))
    .orderBy(events.startDate)
    .limit(limit)
    .offset(offset);
}

export async function getEventsCount(
  db: Database,
  { category, search, location }: { category?: string; search?: string; location?: string }
) {
  const conditions = [sql`${events.status} IN ('upcoming', 'ongoing')`];
  if (category) conditions.push(eq(events.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${events.title} LIKE ${pattern} COLLATE NOCASE OR ${events.description} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) conditions.push(sql`${events.location} LIKE ${`%${location}%`} COLLATE NOCASE`);

  const result = await db.select({ count: sql<number>`count(*)` }).from(events).where(and(...conditions));
  return result[0]?.count ?? 0;
}

export async function getEventById(db: Database, id: string) {
  const result = await db
    .select({
      id: events.id,
      userId: events.userId,
      title: events.title,
      description: events.description,
      category: events.category,
      startDate: events.startDate,
      endDate: events.endDate,
      startTime: events.startTime,
      endTime: events.endTime,
      venue: events.venue,
      location: events.location,
      ticketPrice: events.ticketPrice,
      ticketUrl: events.ticketUrl,
      contactPhone: events.contactPhone,
      contactWhatsapp: events.contactWhatsapp,
      imageUrls: events.imageUrls,
      status: events.status,
      createdAt: events.createdAt,
      userName: users.displayName,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(eq(events.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createEvent(
  db: Database,
  userId: string,
  data: {
    title: string;
    description?: string;
    category: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    venue?: string;
    location?: string;
    ticketPrice?: string;
    ticketUrl?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    imageUrls?: string[];
  }
) {
  const id = generateId();
  const now = new Date();

  await db.insert(events).values({
    id,
    userId,
    title: data.title,
    description: data.description || null,
    category: data.category,
    startDate: data.startDate,
    endDate: data.endDate || null,
    startTime: data.startTime || null,
    endTime: data.endTime || null,
    venue: data.venue || null,
    location: data.location || null,
    ticketPrice: data.ticketPrice || null,
    ticketUrl: data.ticketUrl || null,
    contactPhone: data.contactPhone || null,
    contactWhatsapp: data.contactWhatsapp || null,
    imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : null,
    status: 'upcoming',
    createdAt: now,
    updatedAt: now,
  });
  return { id };
}

export async function deleteEvent(db: Database, id: string, userId: string) {
  await db.delete(events).where(and(eq(events.id, id), eq(events.userId, userId)));
}

export async function updateEvent(
  db: Database, id: string, userId: string,
  data: Record<string, unknown>
) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && k !== 'id' && k !== 'userId') {
      if (k === 'imageUrls') updates[k] = v ? JSON.stringify(v) : null;
      else updates[k] = v;
    }
  }
  await db.update(events).set(updates).where(and(eq(events.id, id), eq(events.userId, userId)));
}
