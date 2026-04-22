import { eq } from 'drizzle-orm';
import { users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function createUser(
  db: Database,
  data: {
    email: string;
    passwordHash: string;
    displayName: string;
  }
) {
  const now = new Date();
  const id = generateId();
  const username = data.email.split('@')[0];

  await db.insert(users).values({
    id,
    email: data.email,
    username,
    passwordHash: data.passwordHash,
    displayName: data.displayName,
    createdAt: now,
    updatedAt: now,
  });

  return { id };
}

export async function getUserByEmail(db: Database, email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserById(db: Database, id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function updateUser(
  db: Database,
  userId: string,
  data: Partial<{
    displayName: string;
    phone: string;
  }>
) {
  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
