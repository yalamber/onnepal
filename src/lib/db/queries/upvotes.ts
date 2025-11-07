import { eq, and, sql } from 'drizzle-orm';
import type { Database } from '../index';
import { upvotes, posts } from '../schema';

export async function addUpvote(db: Database, userId: string, postId: string) {
  const now = new Date();

  // Check if already upvoted
  const existing = await db
    .select()
    .from(upvotes)
    .where(and(eq(upvotes.userId, userId), eq(upvotes.postId, postId)))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, message: 'Already upvoted' };
  }

  // Add upvote
  await db.insert(upvotes).values({
    userId,
    postId,
    createdAt: now,
  });

  // Increment post upvote count
  await db
    .update(posts)
    .set({
      upvoteCount: sql`${posts.upvoteCount} + 1`,
    })
    .where(eq(posts.id, postId));

  return { success: true };
}

export async function removeUpvote(db: Database, userId: string, postId: string) {
  await db
    .delete(upvotes)
    .where(and(eq(upvotes.userId, userId), eq(upvotes.postId, postId)));

  // Decrement post upvote count
  await db
    .update(posts)
    .set({
      upvoteCount: sql`${posts.upvoteCount} - 1`,
    })
    .where(eq(posts.id, postId));

  return { success: true };
}

export async function hasUserUpvoted(db: Database, userId: string, postId: string) {
  const result = await db
    .select()
    .from(upvotes)
    .where(and(eq(upvotes.userId, userId), eq(upvotes.postId, postId)))
    .limit(1);

  return result.length > 0;
}

export async function getPostUpvoteCount(db: Database, postId: string) {
  const result = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);

  return result[0]?.upvoteCount || 0;
}

export async function getUserUpvotes(db: Database, userId: string) {
  return await db.select().from(upvotes).where(eq(upvotes.userId, userId));
}
