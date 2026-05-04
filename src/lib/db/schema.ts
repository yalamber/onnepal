import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  phone: text('phone'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
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
  coverPosition: text('cover_position').default('50 50'),
  phone: text('phone'),
  address: text('address'),
  businessHours: text('business_hours'), // JSON: {"mon":"9:00-17:00","tue":"9:00-17:00",...}
  whatsappNumber: text('whatsapp_number'),
  mapAddress: text('map_address'), // for map embed
  bookingEnabled: integer('booking_enabled', { mode: 'boolean' }).notNull().default(false),
  enabledModules: text('enabled_modules').default('["products","links","announcements"]'),
  primaryColor: text('primary_color').default('#2563eb'),
  accentColor: text('accent_color').default('#1d4ed8'),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('businesses_user_idx').on(table.userId),
  index('businesses_subdomain_idx').on(table.subdomain),
  index('businesses_published_idx').on(table.isPublished),
  index('businesses_category_idx').on(table.businessCategory),
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
  city: text('city'),
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

// Gallery images
export const galleryImages = sqliteTable('gallery_images', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  imageKey: text('image_key').notNull(),
  caption: text('caption'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('gallery_images_business_idx').on(table.businessId),
]));

// Reviews
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  reviewerName: text('reviewer_name').notNull(),
  reviewerEmail: text('reviewer_email'),
  rating: integer('rating').notNull(),
  content: text('content'),
  isApproved: integer('is_approved', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('reviews_business_idx').on(table.businessId),
  index('reviews_approved_idx').on(table.isApproved),
]));

// Menu items
export const menuItems = sqliteTable('menu_items', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price'),
  category: text('category'),
  imageKey: text('image_key'),
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('menu_items_business_idx').on(table.businessId),
]));

// Special offers
export const specialOffers = sqliteTable('special_offers', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  discountText: text('discount_text'),
  code: text('code'),
  startsAt: integer('starts_at', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('special_offers_business_idx').on(table.businessId),
]));

// Team members
export const teamMembers = sqliteTable('team_members', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role'),
  imageKey: text('image_key'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('team_members_business_idx').on(table.businessId),
]));

// FAQs
export const faqs = sqliteTable('faqs', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('faqs_business_idx').on(table.businessId),
]));

// Bookings
export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  businessId: text('business_id').notNull().references(() => businesses.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  customerEmail: text('customer_email'),
  date: text('date').notNull(),
  time: text('time'),
  service: text('service'),
  message: text('message'),
  status: text('status', { enum: ['pending', 'confirmed', 'cancelled'] }).notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('bookings_business_idx').on(table.businessId),
  index('bookings_status_idx').on(table.status),
]));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  classifieds: many(classifieds),
  places: many(places),
  discussions: many(discussions),
  discussionReplies: many(discussionReplies),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(users, { fields: [businesses.userId], references: [users.id] }),
  socialLinks: many(socialLinks),
  announcements: many(announcements),
  products: many(products),
  ctaButtons: many(ctaButtons),
  pageViews: many(pageViews),
  galleryImages: many(galleryImages),
  reviews: many(reviews),
  menuItems: many(menuItems),
  specialOffers: many(specialOffers),
  teamMembers: many(teamMembers),
  faqs: many(faqs),
  bookings: many(bookings),
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

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  business: one(businesses, { fields: [galleryImages.businessId], references: [businesses.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  business: one(businesses, { fields: [reviews.businessId], references: [businesses.id] }),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  business: one(businesses, { fields: [menuItems.businessId], references: [businesses.id] }),
}));

export const specialOffersRelations = relations(specialOffers, ({ one }) => ({
  business: one(businesses, { fields: [specialOffers.businessId], references: [businesses.id] }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  business: one(businesses, { fields: [teamMembers.businessId], references: [businesses.id] }),
}));

export const faqsRelations = relations(faqs, ({ one }) => ({
  business: one(businesses, { fields: [faqs.businessId], references: [businesses.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  business: one(businesses, { fields: [bookings.businessId], references: [businesses.id] }),
}));

export const lostFound = sqliteTable('lost_found', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['lost', 'found'] }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  location: text('location'),
  city: text('city'),
  itemDate: text('item_date'),
  reward: text('reward'),
  contactPhone: text('contact_phone'),
  contactWhatsapp: text('contact_whatsapp'),
  imageUrls: text('image_urls'),
  status: text('status', { enum: ['open', 'resolved'] }).notNull().default('open'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('lost_found_user_idx').on(table.userId),
  index('lost_found_type_idx').on(table.type),
  index('lost_found_category_idx').on(table.category),
  index('lost_found_status_idx').on(table.status),
  index('lost_found_created_idx').on(table.createdAt),
]));

export const lostFoundRelations = relations(lostFound, ({ one }) => ({
  user: one(users, { fields: [lostFound.userId], references: [users.id] }),
}));

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  venue: text('venue'),
  location: text('location'),
  city: text('city'),
  ticketPrice: text('ticket_price'),
  ticketUrl: text('ticket_url'),
  contactPhone: text('contact_phone'),
  contactWhatsapp: text('contact_whatsapp'),
  imageUrls: text('image_urls'),
  status: text('status', { enum: ['upcoming', 'ongoing', 'completed', 'cancelled'] }).notNull().default('upcoming'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('events_user_idx').on(table.userId),
  index('events_category_idx').on(table.category),
  index('events_status_idx').on(table.status),
  index('events_start_date_idx').on(table.startDate),
]));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, { fields: [events.userId], references: [users.id] }),
}));

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  company: text('company').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  type: text('type', { enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'] }).notNull().default('full-time'),
  location: text('location'),
  city: text('city'),
  isRemote: integer('is_remote', { mode: 'boolean' }).notNull().default(false),
  salary: text('salary'),
  experience: text('experience'),
  applyUrl: text('apply_url'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  imageUrls: text('image_urls'),
  status: text('status', { enum: ['open', 'closed'] }).notNull().default('open'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
}, (table) => ([
  index('jobs_user_idx').on(table.userId),
  index('jobs_category_idx').on(table.category),
  index('jobs_type_idx').on(table.type),
  index('jobs_status_idx').on(table.status),
  index('jobs_created_idx').on(table.createdAt),
]));

export const jobsRelations = relations(jobs, ({ one }) => ({
  user: one(users, { fields: [jobs.userId], references: [users.id] }),
}));

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('comments_target_idx').on(table.targetType, table.targetId),
  index('comments_user_idx').on(table.userId),
  index('comments_created_idx').on(table.createdAt),
]));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  senderId: text('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipientId: text('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  listingType: text('listing_type').notNull(),
  listingId: text('listing_id').notNull(),
  listingTitle: text('listing_title').notNull(),
  content: text('content').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('messages_sender_idx').on(table.senderId),
  index('messages_recipient_idx').on(table.recipientId),
  index('messages_listing_idx').on(table.listingType, table.listingId),
  index('messages_created_idx').on(table.createdAt),
]));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const places = sqliteTable('places', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  location: text('location'),
  city: text('city'),
  address: text('address'),
  imageUrls: text('image_urls'),
  contactPhone: text('contact_phone'),
  contactWhatsapp: text('contact_whatsapp'),
  website: text('website'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('places_user_idx').on(table.userId),
  index('places_category_idx').on(table.category),
  index('places_status_idx').on(table.status),
  index('places_city_idx').on(table.city),
  index('places_created_idx').on(table.createdAt),
]));

export const placesRelations = relations(places, ({ one }) => ({
  user: one(users, { fields: [places.userId], references: [users.id] }),
}));

// Bookmarks
export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: text('target_type').notNull(), // 'classified', 'job', 'event', 'lost-found', 'place'
  targetId: text('target_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('bookmarks_user_idx').on(table.userId),
  index('bookmarks_target_idx').on(table.targetType, table.targetId),
]));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
}));

// Discussions
export const discussions = sqliteTable('discussions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  category: text('category').notNull(),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  replyCount: integer('reply_count').notNull().default(0),
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('discussions_category_idx').on(table.category),
  index('discussions_user_idx').on(table.userId),
  index('discussions_last_activity_idx').on(table.lastActivityAt),
]));

export const discussionReplies = sqliteTable('discussion_replies', {
  id: text('id').primaryKey(),
  discussionId: text('discussion_id').notNull().references(() => discussions.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('discussion_replies_discussion_idx').on(table.discussionId),
  index('discussion_replies_user_idx').on(table.userId),
]));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  user: one(users, { fields: [discussions.userId], references: [users.id] }),
  replies: many(discussionReplies),
}));

export const discussionRepliesRelations = relations(discussionReplies, ({ one }) => ({
  discussion: one(discussions, { fields: [discussionReplies.discussionId], references: [discussions.id] }),
  user: one(users, { fields: [discussionReplies.userId], references: [users.id] }),
}));

// Reports
export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'reviewed', 'dismissed'] }).notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('reports_user_idx').on(table.userId),
  index('reports_status_idx').on(table.status),
]));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, { fields: [reports.userId], references: [users.id] }),
}));

export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  location: text('location'),
  priceType: text('price_type'),
  price: text('price'),
  contactPhone: text('contact_phone'),
  contactWhatsapp: text('contact_whatsapp'),
  imageUrls: text('image_urls'),
  status: text('status').notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('services_category_idx').on(table.category),
  index('services_user_idx').on(table.userId),
  index('services_status_idx').on(table.status),
  index('services_created_idx').on(table.createdAt),
]));

// Voices — user-submitted articles / personal essays / community pieces.
// Editors mark `isFeatured` true for the homepage mosaic; remaining recent
// published items show under "From the neighborhood".
export const voices = sqliteTable('voices', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(), // markdown
  coverImageUrl: text('cover_image_url'),
  city: text('city'),
  category: text('category'), // e.g. food, neighborhood, opinion, guide
  status: text('status', { enum: ['draft', 'pending', 'published', 'rejected'] }).notNull().default('pending'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => ([
  index('voices_user_idx').on(table.userId),
  index('voices_slug_idx').on(table.slug),
  index('voices_status_idx').on(table.status),
  index('voices_featured_idx').on(table.isFeatured),
  index('voices_published_idx').on(table.publishedAt),
  index('voices_city_idx').on(table.city),
]));

export const voicesRelations = relations(voices, ({ one }) => ({
  user: one(users, { fields: [voices.userId], references: [users.id] }),
}));
