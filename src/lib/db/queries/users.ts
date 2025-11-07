import { eq } from 'drizzle-orm';
import type { Database } from '../index';
import { users } from '../schema';
import { nanoid } from 'nanoid';

export async function createUser(
  db: Database,
  data: {
    email: string;
    username: string;
    passwordHash: string;
    displayName?: string;
  }
) {
  const userId = nanoid();
  const now = new Date();

  await db.insert(users).values({
    id: userId,
    email: data.email,
    username: data.username,
    passwordHash: data.passwordHash,
    displayName: data.displayName || data.username,
    createdAt: now,
    updatedAt: now,
  });

  return userId;
}

export async function getUserByEmail(db: Database, email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getUserByUsername(db: Database, username: string) {
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result[0] || null;
}

export async function getUserById(db: Database, id: string) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function updateUser(
  db: Database,
  userId: string,
  data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }
) {
  await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateUserRole(db: Database, userId: string, role: 'user' | 'moderator' | 'admin') {
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function banUser(db: Database, userId: string) {
  await db.update(users).set({ isBanned: true, updatedAt: new Date() }).where(eq(users.id, userId));
}
