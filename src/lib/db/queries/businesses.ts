import { eq, and, sql } from 'drizzle-orm';
import { businesses } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

const MAX_BUSINESSES_PER_USER = 5;

export async function getBusinessById(db: Database, businessId: string) {
  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  return result[0] || null;
}

export async function getBusinessBySubdomain(db: Database, subdomain: string) {
  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.subdomain, subdomain))
    .limit(1);
  return result[0] || null;
}

export async function getBusinessesByUserId(db: Database, userId: string) {
  return db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, userId));
}

export async function getBusinessCount(db: Database, userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(businesses)
    .where(eq(businesses.userId, userId));
  return result[0]?.count || 0;
}

export async function isSubdomainTaken(db: Database, subdomain: string): Promise<boolean> {
  const result = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.subdomain, subdomain))
    .limit(1);
  return result.length > 0;
}

export async function createBusiness(
  db: Database,
  userId: string,
  data: {
    subdomain: string;
    businessName: string;
    businessCategory?: string;
  }
) {
  const count = await getBusinessCount(db, userId);
  if (count >= MAX_BUSINESSES_PER_USER) {
    throw new Error(`Maximum of ${MAX_BUSINESSES_PER_USER} businesses per user`);
  }

  const id = generateId();
  const now = new Date();

  await db.insert(businesses).values({
    id,
    userId,
    subdomain: data.subdomain,
    businessName: data.businessName,
    businessCategory: data.businessCategory || null,
    createdAt: now,
    updatedAt: now,
  });

  return { id, subdomain: data.subdomain };
}

export async function updateBusinessProfile(
  db: Database,
  businessId: string,
  data: Partial<{
    businessName: string;
    businessCategory: string;
    description: string;
    logoUrl: string;
    coverImageUrl: string;
    coverPosition: string;
    phone: string;
    address: string;
    businessHours: string;
    primaryColor: string;
    accentColor: string;
  }>
) {
  await db
    .update(businesses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(businesses.id, businessId));
}

export async function publishBusiness(db: Database, businessId: string) {
  await db
    .update(businesses)
    .set({ isPublished: true, updatedAt: new Date() })
    .where(eq(businesses.id, businessId));
}

export async function unpublishBusiness(db: Database, businessId: string) {
  await db
    .update(businesses)
    .set({ isPublished: false, updatedAt: new Date() })
    .where(eq(businesses.id, businessId));
}

export async function deleteBusiness(db: Database, businessId: string, userId: string) {
  await db
    .delete(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.userId, userId)));
}
