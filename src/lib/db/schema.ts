import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  phone: text('phone'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const businesses = sqliteTable('businesses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subdomain: text('subdomain').notNull().unique(),
  businessName: text('business_name').notNull(),
  businessCategory: text('business_category'),
  description: text('description'),
  logoUrl: text('logo_url'),
  coverImageUrl: text('cover_image_url'),
  phone: text('phone'),
  address: text('address'),
  businessHours: text('business_hours'),
  primaryColor: text('primary_color').default('#2563eb'),
  accentColor: text('accent_color').default('#1d4ed8'),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('businesses_user_idx').on(table.userId),
  index('businesses_subdomain_idx').on(table.subdomain),
]));

export const socialLinks = sqliteTable('social_links', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
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
  index('social_links_business_idx').on(table.businessId),
]));

export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('announcements_business_idx').on(table.businessId),
]));

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price'),
  imageUrl: text('image_url'),
  category: text('category'),
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('products_business_idx').on(table.businessId),
]));

export const ctaButtons = sqliteTable('cta_buttons', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  url: text('url').notNull(),
  style: text('style', { enum: ['primary', 'secondary', 'outline'] }).notNull().default('primary'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('cta_buttons_business_idx').on(table.businessId),
]));

export const pageViews = sqliteTable('page_views', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  referrer: text('referrer'),
  viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('page_views_business_idx').on(table.businessId),
  index('page_views_viewed_at_idx').on(table.viewedAt),
]));

export const classifieds = sqliteTable('classifieds', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  price: text('price'),
  category: text('category').notNull(),
  location: text('location'),
  contactPhone: text('contact_phone'),
  contactWhatsapp: text('contact_whatsapp'),
  imageUrls: text('image_urls'),
  status: text('status', { enum: ['active', 'sold', 'expired'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
}, (table) => ([
  index('classifieds_user_idx').on(table.userId),
  index('classifieds_category_idx').on(table.category),
  index('classifieds_status_idx').on(table.status),
  index('classifieds_created_idx').on(table.createdAt),
]));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  classifieds: many(classifieds),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, { fields: [businesses.userId], references: [users.id] }),
  socialLinks: many(socialLinks),
  announcements: many(announcements),
  products: many(products),
  ctaButtons: many(ctaButtons),
  pageViews: many(pageViews),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  business: one(businesses, { fields: [socialLinks.businessId], references: [businesses.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  business: one(businesses, { fields: [announcements.businessId], references: [businesses.id] }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  business: one(businesses, { fields: [products.businessId], references: [businesses.id] }),
}));

export const ctaButtonsRelations = relations(ctaButtons, ({ one }) => ({
  business: one(businesses, { fields: [ctaButtons.businessId], references: [businesses.id] }),
}));

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  business: one(businesses, { fields: [pageViews.businessId], references: [businesses.id] }),
}));

export const classifiedsRelations = relations(classifieds, ({ one }) => ({
  user: one(users, { fields: [classifieds.userId], references: [users.id] }),
}));
