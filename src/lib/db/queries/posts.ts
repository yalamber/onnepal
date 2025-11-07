import { eq, desc, sql } from 'drizzle-orm';
import type { Database } from '../index';
import { posts, users, postTags } from '../schema';
import { nanoid } from 'nanoid';
import { slugify } from '@/lib/utils';

export async function createPost(
  db: Database,
  data: {
    authorId: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    tagIds?: string[];
  }
) {
  const postId = nanoid();
  const slug = `${slugify(data.title)}-${nanoid(6)}`;
  const now = new Date();

  await db.insert(posts).values({
    id: postId,
    authorId: data.authorId,
    title: data.title,
    slug,
    content: data.content,
    excerpt: data.excerpt,
    coverImageUrl: data.coverImageUrl,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });

  // Add tags if provided
  if (data.tagIds && data.tagIds.length > 0) {
    await db.insert(postTags).values(
      data.tagIds.map((tagId) => ({
        postId,
        tagId,
      }))
    );
  }

  return { id: postId, slug };
}

export async function getPostBySlug(db: Database, slug: string) {
  const result = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.slug, slug))
    .limit(1);

  return result[0] || null;
}

export async function getPostById(db: Database, postId: string) {
  const result = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  return result[0] || null;
}

export async function getFeaturedPosts(db: Database, limit: number = 20) {
  // Get published posts with enough upvotes
  const result = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.upvoteCount), desc(posts.createdAt))
    .limit(limit);

  return result;
}

export async function getRecentPosts(db: Database, limit: number = 20, offset: number = 0) {
  const result = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function getPendingPosts(db: Database) {
  const result = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, 'pending'))
    .orderBy(desc(posts.createdAt));

  return result;
}

export async function getUserPosts(db: Database, userId: string) {
  const result = await db
    .select({
      post: posts,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt));

  return result;
}

export async function updatePost(
  db: Database,
  postId: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImageUrl?: string;
  }
) {
  interface UpdateData {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImageUrl?: string;
    slug?: string;
    updatedAt: Date;
  }

  const updateData: UpdateData = {
    ...data,
    updatedAt: new Date(),
  };

  // Update slug if title changed
  if (data.title) {
    updateData.slug = `${slugify(data.title)}-${nanoid(6)}`;
  }

  await db.update(posts).set(updateData).where(eq(posts.id, postId));
}

export async function updatePostStatus(
  db: Database,
  postId: string,
  status: 'pending' | 'approved' | 'rejected' | 'published'
) {
  interface StatusUpdate {
    status: 'pending' | 'approved' | 'rejected' | 'published';
    updatedAt: Date;
    publishedAt?: Date;
  }

  const updateData: StatusUpdate = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'published') {
    updateData.publishedAt = new Date();
  }

  await db.update(posts).set(updateData).where(eq(posts.id, postId));
}

export async function incrementViewCount(db: Database, postId: string) {
  await db
    .update(posts)
    .set({
      viewCount: sql`${posts.viewCount} + 1`,
    })
    .where(eq(posts.id, postId));
}

export async function deletePost(db: Database, postId: string) {
  await db.delete(posts).where(eq(posts.id, postId));
}
