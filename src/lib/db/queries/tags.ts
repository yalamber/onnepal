import { eq } from 'drizzle-orm';
import type { Database } from '../index';
import { tags, postTags } from '../schema';
import { nanoid } from 'nanoid';
import { slugify } from '@/lib/utils';

export async function createTag(db: Database, name: string) {
  const tagId = nanoid();
  const slug = slugify(name);
  const now = new Date();

  await db.insert(tags).values({
    id: tagId,
    name,
    slug,
    createdAt: now,
  });

  return tagId;
}

export async function getOrCreateTag(db: Database, name: string) {
  const slug = slugify(name);
  const existing = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  return await createTag(db, name);
}

export async function getAllTags(db: Database) {
  return await db.select().from(tags);
}

export async function getPostTags(db: Database, postId: string) {
  const result = await db
    .select({
      tag: tags,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId));

  return result.map((r) => r.tag);
}
