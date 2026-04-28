import { eq, and, desc, sql } from 'drizzle-orm';
import { comments, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getComments(db: Database, targetType: string, targetId: string) {
  return db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      userName: users.displayName,
      userId: comments.userId,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.targetType, targetType), eq(comments.targetId, targetId)))
    .orderBy(desc(comments.createdAt));
}

export async function createComment(
  db: Database,
  userId: string,
  data: { targetType: string; targetId: string; content: string }
) {
  const id = generateId();
  await db.insert(comments).values({
    id,
    userId,
    targetType: data.targetType,
    targetId: data.targetId,
    content: data.content,
    createdAt: new Date(),
  });
  return { id };
}

export async function deleteComment(db: Database, id: string, userId: string) {
  await db.delete(comments).where(and(eq(comments.id, id), eq(comments.userId, userId)));
}
