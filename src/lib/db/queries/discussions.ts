import { eq, and, desc, sql } from 'drizzle-orm';
import { discussions, discussionReplies, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

interface DiscussionFilters {
  category?: string;
  search?: string;
  page: number;
  limit: number;
}

export async function getDiscussions(
  db: Database,
  { category, search, page, limit }: DiscussionFilters
) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (category) conditions.push(eq(discussions.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${discussions.title} LIKE ${pattern} COLLATE NOCASE OR ${discussions.content} LIKE ${pattern} COLLATE NOCASE)` as any
    );
  }

  const offset = (page - 1) * limit;
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select({
      id: discussions.id,
      userId: discussions.userId,
      title: discussions.title,
      content: discussions.content,
      category: discussions.category,
      isPinned: discussions.isPinned,
      replyCount: discussions.replyCount,
      lastActivityAt: discussions.lastActivityAt,
      createdAt: discussions.createdAt,
      userName: users.displayName,
    })
    .from(discussions)
    .leftJoin(users, eq(discussions.userId, users.id))
    .where(where)
    .orderBy(desc(discussions.isPinned), desc(discussions.lastActivityAt))
    .limit(limit)
    .offset(offset);
}

export async function getDiscussionsCount(
  db: Database,
  { category, search }: { category?: string; search?: string }
) {
  const conditions: ReturnType<typeof eq>[] = [];
  if (category) conditions.push(eq(discussions.category, category));
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      sql`(${discussions.title} LIKE ${pattern} COLLATE NOCASE OR ${discussions.content} LIKE ${pattern} COLLATE NOCASE)` as any
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const result = await db.select({ count: sql<number>`count(*)` }).from(discussions).where(where);
  return result[0]?.count ?? 0;
}

export async function getDiscussionById(db: Database, id: string) {
  const result = await db
    .select({
      id: discussions.id,
      userId: discussions.userId,
      title: discussions.title,
      content: discussions.content,
      category: discussions.category,
      isPinned: discussions.isPinned,
      replyCount: discussions.replyCount,
      lastActivityAt: discussions.lastActivityAt,
      createdAt: discussions.createdAt,
      userName: users.displayName,
    })
    .from(discussions)
    .leftJoin(users, eq(discussions.userId, users.id))
    .where(eq(discussions.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createDiscussion(
  db: Database,
  userId: string,
  data: { title: string; content?: string | null; category: string }
) {
  const id = generateId();
  const now = new Date();

  await db.insert(discussions).values({
    id,
    userId,
    title: data.title,
    content: data.content || null,
    category: data.category,
    isPinned: false,
    replyCount: 0,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
  });
  return { id };
}

export async function deleteDiscussion(db: Database, id: string, userId: string) {
  await db.delete(discussions).where(and(eq(discussions.id, id), eq(discussions.userId, userId)));
}

export async function getReplies(db: Database, discussionId: string) {
  return db
    .select({
      id: discussionReplies.id,
      discussionId: discussionReplies.discussionId,
      userId: discussionReplies.userId,
      content: discussionReplies.content,
      createdAt: discussionReplies.createdAt,
      userName: users.displayName,
    })
    .from(discussionReplies)
    .leftJoin(users, eq(discussionReplies.userId, users.id))
    .where(eq(discussionReplies.discussionId, discussionId))
    .orderBy(discussionReplies.createdAt)
    .limit(200);
}

export async function createReply(
  db: Database,
  userId: string,
  data: { discussionId: string; content: string }
) {
  const id = generateId();
  const now = new Date();

  await db.insert(discussionReplies).values({
    id,
    discussionId: data.discussionId,
    userId,
    content: data.content,
    createdAt: now,
  });

  // increment reply_count and update last_activity_at
  await db
    .update(discussions)
    .set({
      replyCount: sql`${discussions.replyCount} + 1`,
      lastActivityAt: now,
      updatedAt: now,
    })
    .where(eq(discussions.id, data.discussionId));

  return { id };
}

export async function deleteReply(db: Database, id: string, userId: string) {
  // Get the reply to find the discussion
  const reply = await db
    .select({ discussionId: discussionReplies.discussionId })
    .from(discussionReplies)
    .where(and(eq(discussionReplies.id, id), eq(discussionReplies.userId, userId)))
    .limit(1);

  if (reply.length === 0) return;

  await db.delete(discussionReplies).where(and(eq(discussionReplies.id, id), eq(discussionReplies.userId, userId)));

  // decrement reply_count
  await db
    .update(discussions)
    .set({
      replyCount: sql`MAX(0, ${discussions.replyCount} - 1)`,
      updatedAt: new Date(),
    })
    .where(eq(discussions.id, reply[0].discussionId));
}
