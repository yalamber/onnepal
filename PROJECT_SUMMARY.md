# OnNepal.com - Project Summary

## Overview

OnNepal.com is a fully-functional citizen journalism portal built with Next.js 15 and deployed on Cloudflare Workers. The platform enables users to share stories about Nepal with a community-driven upvote system that determines featured content.

## What Has Been Built

### ✅ Complete Full-Stack Application

1. **Authentication System**
   - JWT-based authentication with httpOnly cookies
   - Secure password hashing with bcrypt
   - User roles: user, moderator, admin
   - Session management and protected routes

2. **Database Layer (Drizzle ORM + D1)**
   - Complete schema with 7 tables
   - User management
   - Posts with status tracking
   - Upvoting system
   - Moderation audit trail
   - Tags and categorization
   - Comment system (foundation)

3. **API Routes (Edge Runtime)**
   - `/api/auth/*` - Authentication endpoints
   - `/api/posts/*` - CRUD operations for posts
   - `/api/posts/[slug]/upvote` - Upvote/downvote
   - `/api/moderate/*` - Moderation endpoints
   - `/api/upload` - Image upload to R2
   - `/api/users/me/posts` - User's posts

4. **Frontend Pages**
   - **Homepage** - Hero section + featured posts grid
   - **Login/Signup** - Authentication forms
   - **All Posts** - Browse all published posts
   - **Submit Post** - Markdown-supported post editor
   - **Post View** - Individual post with upvoting
   - **Moderation Queue** - Approve/reject pending posts
   - **Dashboard** - User profile and post management

5. **UI Components**
   - Reusable component library (Button, Input, Textarea, Card)
   - PostCard with upvote functionality
   - UpvoteButton with optimistic updates
   - Responsive Navbar with auth state
   - Mobile-friendly design

6. **Features Implemented**
   - ✅ User registration and login
   - ✅ Post creation with Markdown support
   - ✅ Community upvoting system
   - ✅ Featured posts algorithm
   - ✅ Moderation queue for content approval
   - ✅ View count tracking
   - ✅ Tag system (backend ready)
   - ✅ Image upload to R2
   - ✅ User dashboard
   - ✅ Role-based access control

## Technology Stack

### Frontend
- **Next.js 15.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **React Markdown** - Markdown rendering

### Backend
- **Cloudflare Workers** - Serverless compute
- **D1 Database** - SQLite database
- **R2 Storage** - Object storage for images
- **KV Store** - Caching (configured)
- **Drizzle ORM** - Database ORM

### Auth & Security
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Zod** - Input validation
- **httpOnly cookies** - Secure token storage

### Developer Tools
- **Drizzle Kit** - Database migrations
- **Wrangler** - Cloudflare CLI
- **ESLint** - Code linting
- **OpenNext** - Next.js to Workers adapter

## Project Structure

```
onnepal/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes (Edge runtime)
│   │   │   ├── auth/                 # Authentication
│   │   │   ├── posts/                # Post CRUD
│   │   │   ├── moderate/             # Moderation
│   │   │   ├── upload/               # Image upload
│   │   │   └── users/                # User data
│   │   ├── login/                    # Login page
│   │   ├── signup/                   # Signup page
│   │   ├── posts/                    # Post pages
│   │   │   ├── [slug]/              # Individual post
│   │   │   └── page.tsx             # All posts list
│   │   ├── submit/                   # Submit post form
│   │   ├── moderate/                 # Moderation queue
│   │   ├── dashboard/                # User dashboard
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Homepage
│   ├── components/                   # React components
│   │   ├── ui/                       # Base UI components
│   │   ├── posts/                    # Post-specific components
│   │   └── navbar.tsx                # Navigation
│   ├── lib/                          # Shared utilities
│   │   ├── db/                       # Database
│   │   │   ├── queries/              # Query functions
│   │   │   ├── schema.ts             # Drizzle schema
│   │   │   └── index.ts              # DB client
│   │   ├── auth/                     # Auth utilities
│   │   │   ├── password.ts           # Password hashing
│   │   │   ├── jwt.ts                # JWT tokens
│   │   │   ├── session.ts            # Session management
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── validators/               # Zod schemas
│   │   ├── cloudflare.ts             # Cloudflare bindings
│   │   └── utils.ts                  # Helper functions
│   └── types/                        # TypeScript types
├── drizzle.config.ts                 # Drizzle configuration
├── wrangler.jsonc                    # Cloudflare config
├── next.config.ts                    # Next.js config
├── open-next.config.ts               # OpenNext config
├── CLAUDE.md                         # AI assistant guide
├── SETUP.md                          # Setup instructions
└── package.json                      # Dependencies

```

## Database Schema

### Tables Created

1. **users** - User accounts with roles and authentication
2. **posts** - Articles with status, upvotes, views
3. **upvotes** - Vote tracking (prevents duplicates)
4. **moderation_actions** - Audit log for moderators
5. **tags** - Content categorization
6. **post_tags** - Many-to-many posts↔tags
7. **comments** - Nested comments (ready for implementation)

### Key Relationships
- User → Posts (one-to-many)
- User → Upvotes (one-to-many)
- Post → Upvotes (one-to-many)
- Post → Tags (many-to-many through post_tags)
- Post → Comments (one-to-many)

## What You Need to Do Before Running

1. **Set up Cloudflare Resources**
   ```bash
   wrangler d1 create onnepal-db
   wrangler r2 bucket create onnepal-images
   wrangler kv:namespace create CACHE
   ```

2. **Update Configuration**
   - Add database ID to `wrangler.jsonc`
   - Add KV namespace ID to `wrangler.jsonc`
   - Set JWT_SECRET: `wrangler secret put JWT_SECRET`

3. **Run Database Migrations**
   ```bash
   npm run db:generate
   wrangler d1 execute onnepal-db --file=./drizzle/0000_initial.sql
   ```

4. **Create Admin User**
   - Sign up through the website
   - Promote to admin via D1 SQL

5. **Deploy**
   ```bash
   npm run deploy
   ```

See SETUP.md for detailed step-by-step instructions.

## Future Enhancements (Not Yet Built)

While the core platform is complete, here are some features that could be added:

1. **Comments System** - Tables exist, need UI
2. **Search Functionality** - Full-text search with D1 FTS5
3. **Tag Filtering** - Frontend for browsing by tag
4. **User Profiles** - Public profile pages
5. **Email Notifications** - For post status updates
6. **Rich Text Editor** - WYSIWYG instead of Markdown
7. **Image Management** - Gallery, cropping, optimization
8. **Social Sharing** - Share to social media
9. **Analytics Dashboard** - Post performance metrics
10. **RSS Feed** - For published posts
11. **Auto-Moderation** - AI-based content filtering
12. **Multi-language Support** - i18n for Nepali/English

## Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with expiration (7 days)
- ✅ httpOnly cookies (XSS protection)
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ Role-based access control
- ✅ File upload validation (type, size)
- ✅ Protected API routes

## Performance Optimizations

- ✅ Edge runtime for all API routes
- ✅ Server-side rendering for SEO
- ✅ Cloudflare global CDN
- ✅ KV caching infrastructure (ready to use)
- ✅ Optimistic UI updates for upvotes
- ✅ Image optimization with Next.js Image

## Deployment Architecture

```
User Request
    ↓
Cloudflare CDN
    ↓
Next.js Edge Workers (OpenNext)
    ↓
┌─────────┬──────────┬─────────┐
│   D1    │    R2    │   KV    │
│Database │ Images   │  Cache  │
└─────────┴──────────┴─────────┘
```

## Cost Estimation (Cloudflare Free Tier)

- **Workers**: 100,000 requests/day free
- **D1**: 5M reads, 100K writes/day free
- **R2**: 10GB storage, 10M reads/month free
- **KV**: 100K reads, 1K writes/day free

The free tier should handle thousands of daily users easily.

## Conclusion

OnNepal.com is a production-ready citizen journalism platform with all core features implemented. The codebase is well-structured, documented, and ready for deployment. Follow the SETUP.md guide to get it running on Cloudflare.
