import { eq, and, desc, sql } from 'drizzle-orm';
import { voices, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export interface VoiceListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  city: string | null;
  category: string | null;
  publishedAt: number | null;
  isFeatured: boolean;
  authorName: string | null;
  authorUsername: string | null;
}

export interface Voice {
  id: string;
  userId: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  coverCreditName: string | null;
  coverCreditUrl: string | null;
  city: string | null;
  category: string | null;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  isFeatured: boolean;
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
}

function toMs(v: Date | number | null | undefined): number | null {
  if (v == null) return null;
  return v instanceof Date ? v.getTime() : Number(v);
}

interface ListFilters {
  city?: string;
  category?: string;
  search?: string;
  featuredOnly?: boolean;
  excludeIds?: string[];
  page?: number;
  limit?: number;
}

export async function getPublishedVoices(db: Database, filters: ListFilters = {}): Promise<VoiceListItem[]> {
  const { city, category, search, featuredOnly, excludeIds, page = 1, limit = 20 } = filters;
  const conditions = [eq(voices.status, 'published')];
  if (featuredOnly) conditions.push(eq(voices.isFeatured, true));
  if (city) conditions.push(eq(voices.city, city));
  if (category) conditions.push(eq(voices.category, category));
  if (search && search.trim().length > 0) {
    const pattern = `%${search.trim()}%`;
    conditions.push(sql`(${voices.title} LIKE ${pattern} COLLATE NOCASE OR ${voices.excerpt} LIKE ${pattern} COLLATE NOCASE OR ${voices.content} LIKE ${pattern} COLLATE NOCASE)`);
  }
  if (excludeIds && excludeIds.length > 0) {
    conditions.push(sql`${voices.id} NOT IN (${sql.join(excludeIds.map((id) => sql`${id}`), sql`, `)})`);
  }

  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: voices.id,
      slug: voices.slug,
      title: voices.title,
      excerpt: voices.excerpt,
      coverImageUrl: voices.coverImageUrl,
      city: voices.city,
      category: voices.category,
      publishedAt: voices.publishedAt,
      isFeatured: voices.isFeatured,
      authorName: users.displayName,
      authorUsername: users.username,
    })
    .from(voices)
    .leftJoin(users, eq(voices.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(voices.publishedAt), desc(voices.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map((r) => ({
    ...r,
    publishedAt: toMs(r.publishedAt),
  }));
}

export async function getPublishedVoicesCount(db: Database, filters: ListFilters = {}): Promise<number> {
  const { city, category, search } = filters;
  const conditions = [eq(voices.status, 'published')];
  if (city) conditions.push(eq(voices.city, city));
  if (category) conditions.push(eq(voices.category, category));
  if (search && search.trim().length > 0) {
    const pattern = `%${search.trim()}%`;
    conditions.push(sql`(${voices.title} LIKE ${pattern} COLLATE NOCASE OR ${voices.excerpt} LIKE ${pattern} COLLATE NOCASE)`);
  }
  const rows = await db.select({ c: sql<number>`count(*)` }).from(voices).where(and(...conditions));
  return Number(rows[0]?.c ?? 0);
}

export async function getVoiceBySlug(db: Database, slug: string): Promise<Voice | null> {
  const rows = await db
    .select({
      id: voices.id,
      userId: voices.userId,
      slug: voices.slug,
      title: voices.title,
      excerpt: voices.excerpt,
      content: voices.content,
      coverImageUrl: voices.coverImageUrl,
      coverCreditName: voices.coverCreditName,
      coverCreditUrl: voices.coverCreditUrl,
      city: voices.city,
      category: voices.category,
      status: voices.status,
      isFeatured: voices.isFeatured,
      publishedAt: voices.publishedAt,
      createdAt: voices.createdAt,
      updatedAt: voices.updatedAt,
      authorName: users.displayName,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(voices)
    .leftJoin(users, eq(voices.userId, users.id))
    .where(eq(voices.slug, slug))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  return {
    ...r,
    publishedAt: toMs(r.publishedAt),
    createdAt: toMs(r.createdAt) ?? Date.now(),
    updatedAt: toMs(r.updatedAt) ?? Date.now(),
  };
}

interface CreateVoiceInput {
  userId: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  city?: string;
  category?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function createVoice(db: Database, input: CreateVoiceInput): Promise<{ id: string; slug: string }> {
  const id = generateId();
  const baseSlug = slugify(input.title) || `voice-${id.slice(0, 6)}`;
  // dedupe by appending random suffix if slug exists
  const existing = await db.select({ id: voices.id }).from(voices).where(eq(voices.slug, baseSlug)).limit(1);
  const slug = existing.length > 0 ? `${baseSlug}-${id.slice(0, 6)}` : baseSlug;

  const now = new Date();
  await db.insert(voices).values({
    id,
    userId: input.userId,
    slug,
    title: input.title,
    excerpt: input.excerpt || null,
    content: input.content,
    coverImageUrl: input.coverImageUrl || null,
    city: input.city || null,
    category: input.category || null,
    status: 'pending',
    isFeatured: false,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  return { id, slug };
}

export async function getVoicesByUser(db: Database, userId: string): Promise<VoiceListItem[]> {
  const rows = await db
    .select({
      id: voices.id,
      slug: voices.slug,
      title: voices.title,
      excerpt: voices.excerpt,
      coverImageUrl: voices.coverImageUrl,
      city: voices.city,
      category: voices.category,
      publishedAt: voices.publishedAt,
      isFeatured: voices.isFeatured,
      authorName: users.displayName,
      authorUsername: users.username,
    })
    .from(voices)
    .leftJoin(users, eq(voices.userId, users.id))
    .where(eq(voices.userId, userId))
    .orderBy(desc(voices.createdAt));
  return rows.map((r) => ({ ...r, publishedAt: toMs(r.publishedAt) }));
}
