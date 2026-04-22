import { eq, and, like, sql, desc } from 'drizzle-orm';
import { users } from '../schema';
import type { Database } from '../index';

interface DirectoryFilters {
  category?: string;
  search?: string;
  page: number;
  limit: number;
}

export async function getPublishedBusinesses(
  db: Database,
  { category, search, page, limit }: DirectoryFilters
) {
  const conditions = [eq(users.isPublished, true)];

  if (category) {
    conditions.push(eq(users.businessCategory, category));
  }

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      sql`(${users.businessName} LIKE ${searchPattern} COLLATE NOCASE OR ${users.description} LIKE ${searchPattern} COLLATE NOCASE)`
    );
  }

  const offset = (page - 1) * limit;

  const results = await db
    .select({
      id: users.id,
      subdomain: users.subdomain,
      businessName: users.businessName,
      businessCategory: users.businessCategory,
      description: users.description,
      logoUrl: users.logoUrl,
      primaryColor: users.primaryColor,
      accentColor: users.accentColor,
    })
    .from(users)
    .where(and(...conditions))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return results;
}

export async function getPublishedBusinessCount(
  db: Database,
  { category, search }: { category?: string; search?: string }
) {
  const conditions = [eq(users.isPublished, true)];

  if (category) {
    conditions.push(eq(users.businessCategory, category));
  }

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      sql`(${users.businessName} LIKE ${searchPattern} COLLATE NOCASE OR ${users.description} LIKE ${searchPattern} COLLATE NOCASE)`
    );
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

export async function getCategories(db: Database) {
  const results = await db
    .select({
      category: users.businessCategory,
      count: sql<number>`count(*)`,
    })
    .from(users)
    .where(eq(users.isPublished, true))
    .groupBy(users.businessCategory)
    .orderBy(sql`count(*) DESC`);

  // Filter out null categories
  return results.filter(
    (r): r is { category: string; count: number } => r.category !== null
  );
}
