import { eq } from 'drizzle-orm';
import type { Database } from '../index';
import { moderationActions, posts } from '../schema';
import { nanoid } from 'nanoid';

export async function createModerationAction(
  db: Database,
  data: {
    postId: string;
    moderatorId: string;
    action: 'approve' | 'reject' | 'flag';
    reason?: string;
  }
) {
  const actionId = nanoid();
  const now = new Date();

  await db.insert(moderationActions).values({
    id: actionId,
    postId: data.postId,
    moderatorId: data.moderatorId,
    action: data.action,
    reason: data.reason,
    createdAt: now,
  });

  // Update post status based on action
  if (data.action === 'approve') {
    await db
      .update(posts)
      .set({ status: 'published', publishedAt: now, updatedAt: now })
      .where(eq(posts.id, data.postId));
  } else if (data.action === 'reject') {
    await db
      .update(posts)
      .set({ status: 'rejected', updatedAt: now })
      .where(eq(posts.id, data.postId));
  }

  return actionId;
}

export async function getModerationHistory(db: Database, postId: string) {
  return await db.select().from(moderationActions).where(eq(moderationActions.postId, postId));
}
