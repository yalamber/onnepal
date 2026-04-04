import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table (business owners)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  // Business profile fields
  subdomain: text('subdomain').unique(),
  businessName: text('business_name'),
  businessCategory: text('business_category'),
  description: text('description'),
  logoUrl: text('logo_url'),
  coverImageUrl: text('cover_image_url'),
  phone: text('phone'),
  address: text('address'),
  businessHours: text('business_hours'), // JSON string
  primaryColor: text('primary_color').default('#2563eb'), // blue-600
  accentColor: text('accent_color').default('#1d4ed8'), // blue-700
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  onboardingStep: integer('onboarding_step').notNull().default(0), // 0-4
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('users_subdomain_idx').on(table.subdomain),
]));

// Social links table
export const socialLinks = sqliteTable('social_links', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: text('platform', {
    enum: [
      'facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp', 'viber',
      'twitter', 'linkedin', 'website', 'email', 'phone', 'custom'
    ]
  }).notNull(),
  url: text('url').notNull(),
  label: text('label'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('social_links_user_idx').on(table.userId),
]));

// Announcements table
export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('announcements_user_idx').on(table.userId),
]));

// Products table
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price'), // stored as text to handle "Rs. 500" or "Contact for price"
  imageUrl: text('image_url'),
  category: text('category'),
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('products_user_idx').on(table.userId),
]));

// CTA buttons table
export const ctaButtons = sqliteTable('cta_buttons', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  url: text('url').notNull(),
  style: text('style', { enum: ['primary', 'secondary', 'outline'] }).notNull().default('primary'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('cta_buttons_user_idx').on(table.userId),
]));

// Page views table (basic analytics)
export const pageViews = sqliteTable('page_views', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  referrer: text('referrer'),
  viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('page_views_user_idx').on(table.userId),
  index('page_views_viewed_at_idx').on(table.viewedAt),
]));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  socialLinks: many(socialLinks),
  announcements: many(announcements),
  products: many(products),
  ctaButtons: many(ctaButtons),
  pageViews: many(pageViews),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  user: one(users, {
    fields: [socialLinks.userId],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  user: one(users, {
    fields: [announcements.userId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
}));

export const ctaButtonsRelations = relations(ctaButtons, ({ one }) => ({
  user: one(users, {
    fields: [ctaButtons.userId],
    references: [users.id],
  }),
}));

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  user: one(users, {
    fields: [pageViews.userId],
    references: [users.id],
  }),
}));
