import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['user', 'moderator', 'admin'] }).notNull().default('user'),
  isBanned: integer('is_banned', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Posts/Articles table
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImageUrl: text('cover_image_url'),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'published'] })
    .notNull()
    .default('pending'),
  upvoteCount: integer('upvote_count').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  featuredAt: integer('featured_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
});

// Upvotes table
export const upvotes = sqliteTable(
  'upvotes',
  {
    userId: text('user_id').notNull().references(() => users.id),
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] }),
  })
);

// Moderation actions table
export const moderationActions = sqliteTable('moderation_actions', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id),
  moderatorId: text('moderator_id').notNull().references(() => users.id),
  action: text('action', { enum: ['approve', 'reject', 'flag'] }).notNull(),
  reason: text('reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Tags table
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Post tags junction table
export const postTags = sqliteTable(
  'post_tags',
  {
    postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
  })
);

// Comments table (bonus feature for engagement)
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentId: text('parent_id').references((): any => comments.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  upvotes: many(upvotes),
  moderationActions: many(moderationActions),
  comments: many(comments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  upvotes: many(upvotes),
  moderationActions: many(moderationActions),
  postTags: many(postTags),
  comments: many(comments),
}));

export const upvotesRelations = relations(upvotes, ({ one }) => ({
  user: one(users, {
    fields: [upvotes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [upvotes.postId],
    references: [posts.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

export const moderationActionsRelations = relations(moderationActions, ({ one }) => ({
  post: one(posts, {
    fields: [moderationActions.postId],
    references: [posts.id],
  }),
  moderator: one(users, {
    fields: [moderationActions.moderatorId],
    references: [users.id],
  }),
}));
