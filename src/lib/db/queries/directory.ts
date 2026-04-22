import { eq, and, sql, desc } from 'drizzle-orm';
import { businesses } from '../schema';
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
  const conditions = [eq(businesses.isPublished, true)];

  if (category) {
    conditions.push(eq(businesses.businessCategory, category));
  }

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      sql`(${businesses.businessName} LIKE ${searchPattern} COLLATE NOCASE OR ${businesses.description} LIKE ${searchPattern} COLLATE NOCASE)`
    );
  }

  const offset = (page - 1) * limit;

  const results = await db
    .select({
      id: businesses.id,
      subdomain: businesses.subdomain,
      businessName: businesses.businessName,
      businessCategory: businesses.businessCategory,
      description: businesses.description,
      logoUrl: businesses.logoUrl,
      primaryColor: businesses.primaryColor,
      accentColor: businesses.accentColor,
    })
    .from(businesses)
    .where(and(...conditions))
    .orderBy(desc(businesses.createdAt))
    .limit(limit)
    .offset(offset);

  return results;
}

export async function getPublishedBusinessCount(
  db: Database,
  { category, search }: { category?: string; search?: string }
) {
  const conditions = [eq(businesses.isPublished, true)];

  if (category) {
    conditions.push(eq(businesses.businessCategory, category));
  }

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      sql`(${businesses.businessName} LIKE ${searchPattern} COLLATE NOCASE OR ${businesses.description} LIKE ${searchPattern} COLLATE NOCASE)`
    );
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(businesses)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

export async function getCategories(db: Database) {
  const results = await db
    .select({
      category: businesses.businessCategory,
      count: sql<number>`count(*)`,
    })
    .from(businesses)
    .where(eq(businesses.isPublished, true))
    .groupBy(businesses.businessCategory)
    .orderBy(sql`count(*) DESC`);

  // Filter out null categories
  return results.filter(
    (r): r is { category: string; count: number } => r.category !== null
  );
}
