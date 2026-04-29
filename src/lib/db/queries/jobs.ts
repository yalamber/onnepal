import { eq, and, desc, sql } from 'drizzle-orm';
import { jobs, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

interface JobFilters {
  category?: string;
  type?: string;
  search?: string;
  location?: string;
  city?: string;
  page: number;
  limit: number;
}

export async function getJobs(
  db: Database,
  { category, type, search, location, city, page, limit }: JobFilters
) {
  const conditions = [eq(jobs.status, 'open')];

  if (category) conditions.push(eq(jobs.category, category));
  if (type) conditions.push(eq(jobs.type, type as 'full-time'));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${jobs.title} LIKE ${pattern} COLLATE NOCASE OR ${jobs.company} LIKE ${pattern} COLLATE NOCASE OR ${jobs.description} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) conditions.push(sql`${jobs.location} LIKE ${`%${location}%`} COLLATE NOCASE`);
  if (city) conditions.push(eq(jobs.city, city));

  const offset = (page - 1) * limit;

  return db
    .select({
      id: jobs.id,
      title: jobs.title,
      company: jobs.company,
      description: jobs.description,
      category: jobs.category,
      type: jobs.type,
      location: jobs.location,
      isRemote: jobs.isRemote,
      salary: jobs.salary,
      experience: jobs.experience,
      createdAt: jobs.createdAt,
      userName: users.displayName,
    })
    .from(jobs)
    .leftJoin(users, eq(jobs.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(jobs.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getJobsCount(
  db: Database,
  { category, type, search, location, city }: { category?: string; type?: string; search?: string; location?: string; city?: string }
) {
  const conditions = [eq(jobs.status, 'open')];
  if (category) conditions.push(eq(jobs.category, category));
  if (type) conditions.push(eq(jobs.type, type as 'full-time'));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${jobs.title} LIKE ${pattern} COLLATE NOCASE OR ${jobs.company} LIKE ${pattern} COLLATE NOCASE)`
    );
  }
  if (location) conditions.push(sql`${jobs.location} LIKE ${`%${location}%`} COLLATE NOCASE`);
  if (city) conditions.push(eq(jobs.city, city));

  const result = await db.select({ count: sql<number>`count(*)` }).from(jobs).where(and(...conditions));
  return result[0]?.count ?? 0;
}

export async function getJobById(db: Database, id: string) {
  const result = await db
    .select({
      id: jobs.id,
      userId: jobs.userId,
      title: jobs.title,
      company: jobs.company,
      description: jobs.description,
      category: jobs.category,
      type: jobs.type,
      location: jobs.location,
      isRemote: jobs.isRemote,
      salary: jobs.salary,
      experience: jobs.experience,
      applyUrl: jobs.applyUrl,
      contactEmail: jobs.contactEmail,
      contactPhone: jobs.contactPhone,
      imageUrls: jobs.imageUrls,
      status: jobs.status,
      createdAt: jobs.createdAt,
      userName: users.displayName,
    })
    .from(jobs)
    .leftJoin(users, eq(jobs.userId, users.id))
    .where(eq(jobs.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createJob(
  db: Database,
  userId: string,
  data: {
    title: string;
    company: string;
    description?: string;
    category: string;
    type: string;
    location?: string;
    isRemote?: boolean;
    salary?: string;
    experience?: string;
    applyUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    imageUrls?: string[];
  }
) {
  const id = generateId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  await db.insert(jobs).values({
    id,
    userId,
    title: data.title,
    company: data.company,
    description: data.description || null,
    category: data.category,
    type: data.type as 'full-time',
    location: data.location || null,
    isRemote: data.isRemote || false,
    salary: data.salary || null,
    experience: data.experience || null,
    applyUrl: data.applyUrl || null,
    contactEmail: data.contactEmail || null,
    contactPhone: data.contactPhone || null,
    imageUrls: data.imageUrls ? JSON.stringify(data.imageUrls) : null,
    status: 'open',
    createdAt: now,
    updatedAt: now,
    expiresAt,
  });
  return { id };
}

export async function deleteJob(db: Database, id: string, userId: string) {
  await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
}

interface UpdateJobData {
  title?: string;
  description?: string | null;
  company?: string;
  category?: string;
  type?: string;
  location?: string | null;
  isRemote?: boolean;
  salary?: string | null;
  experience?: string | null;
  applyUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  imageUrls?: string[] | null;
  status?: string;
}

export async function updateJob(
  db: Database, id: string, userId: string,
  data: UpdateJobData
) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.company !== undefined) updates.company = data.company;
  if (data.category !== undefined) updates.category = data.category;
  if (data.type !== undefined) updates.type = data.type;
  if (data.location !== undefined) updates.location = data.location;
  if (data.isRemote !== undefined) updates.isRemote = data.isRemote;
  if (data.salary !== undefined) updates.salary = data.salary;
  if (data.experience !== undefined) updates.experience = data.experience;
  if (data.applyUrl !== undefined) updates.applyUrl = data.applyUrl;
  if (data.contactEmail !== undefined) updates.contactEmail = data.contactEmail;
  if (data.contactPhone !== undefined) updates.contactPhone = data.contactPhone;
  if (data.imageUrls !== undefined) updates.imageUrls = data.imageUrls ? JSON.stringify(data.imageUrls) : null;
  if (data.status !== undefined) updates.status = data.status;

  await db.update(jobs).set(updates).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
}
