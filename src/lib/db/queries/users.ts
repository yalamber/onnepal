import { eq } from 'drizzle-orm';
import { users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function createUser(
  db: Database,
  data: {
    email: string;
    passwordHash: string;
    businessName: string;
    subdomain: string;
  }
) {
  const now = new Date();
  const id = generateId();
  const username = data.subdomain;

  await db.insert(users).values({
    id,
    email: data.email,
    username,
    passwordHash: data.passwordHash,
    subdomain: data.subdomain,
    businessName: data.businessName,
    onboardingStep: 1,
    createdAt: now,
    updatedAt: now,
  });

  return { id, username, subdomain: data.subdomain };
}

export async function getUserByEmail(db: Database, email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserById(db: Database, id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function getUserBySubdomain(db: Database, subdomain: string) {
  const result = await db.select().from(users).where(eq(users.subdomain, subdomain)).limit(1);
  return result[0] || null;
}

export async function isSubdomainTaken(db: Database, subdomain: string): Promise<boolean> {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.subdomain, subdomain))
    .limit(1);
  return result.length > 0;
}

export async function updateUserProfile(
  db: Database,
  userId: string,
  data: Partial<{
    businessName: string;
    businessCategory: string;
    description: string;
    logoUrl: string;
    coverImageUrl: string;
    phone: string;
    address: string;
    businessHours: string;
    primaryColor: string;
    accentColor: string;
  }>
) {
  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateOnboardingStep(db: Database, userId: string, step: number) {
  await db
    .update(users)
    .set({ onboardingStep: step, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function publishSite(db: Database, userId: string) {
  await db
    .update(users)
    .set({ isPublished: true, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function unpublishSite(db: Database, userId: string) {
  await db
    .update(users)
    .set({ isPublished: false, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
