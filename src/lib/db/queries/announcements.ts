import { eq, desc, and, or, gt, isNull } from 'drizzle-orm';
import { announcements } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getAnnouncements(db: Database, userId: string) {
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.userId, userId))
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
}

export async function getActiveAnnouncements(db: Database, userId: string) {
  const now = new Date();
  return db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.userId, userId),
        or(isNull(announcements.expiresAt), gt(announcements.expiresAt, now))
      )
    )
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
}

export async function createAnnouncement(
  db: Database,
  userId: string,
  data: {
    title: string;
    content?: string;
    isPinned?: boolean;
    expiresAt?: string;
  }
) {
  const id = generateId();
  const now = new Date();

  await db.insert(announcements).values({
    id,
    userId,
    title: data.title,
    content: data.content || null,
    isPinned: data.isPinned || false,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    createdAt: now,
    updatedAt: now,
  });

  return { id };
}

export async function updateAnnouncement(
  db: Database,
  id: string,
  data: Partial<{
    title: string;
    content: string;
    isPinned: boolean;
    expiresAt: string | null;
  }>
) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
  if (data.expiresAt !== undefined) {
    updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  }

  await db.update(announcements).set(updateData).where(eq(announcements.id, id));
}

export async function deleteAnnouncement(db: Database, id: string) {
  await db.delete(announcements).where(eq(announcements.id, id));
}
