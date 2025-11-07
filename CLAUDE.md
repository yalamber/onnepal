# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OnNepal.com** is a lightweight citizen journalism portal focused on Nepal. The platform enables users to post articles and stories about Nepal, with a community-driven upvote system that determines which content gets featured on the homepage. The platform includes basic moderation capabilities to ensure content quality.

### Core Features
- **User-Generated Content**: Users can create and publish articles/posts about Nepal
- **Upvote System**: Community voting determines content visibility and homepage featuring
- **Featured Content**: Articles with sufficient upvotes appear on the homepage
- **Basic Moderation**: Content moderation system to maintain quality and appropriateness
- **Lightweight Design**: Optimized for performance and accessibility

### Technical Foundation
This is a Next.js 15.4 application configured for deployment on Cloudflare Pages using OpenNext for Cloudflare Workers. The project uses the App Router architecture with TypeScript, React 19, and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Runtime**: React 19.1.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **Deployment**: Cloudflare Pages/Workers via @opennextjs/cloudflare
- **Language**: TypeScript 5
- **Fonts**: Geist Sans and Geist Mono (via next/font)

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with font configuration
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles and Tailwind directives
- `next.config.ts` - Next.js configuration with OpenNext Cloudflare dev support
- `open-next.config.ts` - OpenNext Cloudflare-specific configuration
- `wrangler.jsonc` - Cloudflare Workers configuration
- Path alias: `@/*` maps to `./src/*`

## Common Commands

### Development
```bash
npm run dev          # Start Next.js dev server on localhost:3000
```

### Build & Deploy
```bash
npm run build        # Build Next.js application for production
npm run deploy       # Build and deploy to Cloudflare Pages
npm run preview      # Build and preview locally before deployment
```

### Code Quality
```bash
npm run lint         # Run ESLint (next/core-web-vitals + next/typescript configs)
```

### Cloudflare Type Generation
```bash
npm run cf-typegen   # Generate Cloudflare environment types in cloudflare-env.d.ts
```

## Cloudflare-Specific Configuration

### OpenNext Integration
- The project uses `@opennextjs/cloudflare` adapter for Workers deployment
- `initOpenNextCloudflareForDev()` is called in `next.config.ts` to enable `getCloudflareContext()` during local development
- Built output goes to `.open-next/` directory

### Wrangler Configuration
- Worker entry: `.open-next/worker.js`
- Static assets binding: `ASSETS` (from `.open-next/assets`)
- Compatibility date: `2025-03-01`
- Compatibility flags: `nodejs_compat`, `global_fetch_strictly_public`
- Observability is enabled

### Caching
The project has commented-out R2 incremental cache configuration in `open-next.config.ts`. To enable:
1. Uncomment the `incrementalCache` option
2. Import `r2IncrementalCache` from `@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache`
3. See https://opennext.js.org/cloudflare/caching for details

## TypeScript Configuration

- Target: ES2017
- Module resolution: bundler
- Strict mode enabled
- Cloudflare environment types are included via `./cloudflare-env.d.ts`
- Path aliases configured for `@/*` imports

## Key Architectural Notes

- **App Router**: Uses Next.js App Router (not Pages Router)
- **Server Components**: By default, components in `src/app/` are React Server Components
- **Font Optimization**: Uses `next/font` for automatic font optimization and loading
- **Cloudflare Context**: Use `getCloudflareContext()` to access Cloudflare bindings, environment variables, and request context in API routes and server components
- **Static Assets**: Managed through Wrangler's assets binding

## ESLint Configuration

Uses flat config format (`eslint.config.mjs`) with:
- `next/core-web-vitals`
- `next/typescript`

## Database Setup & Migrations

OnNepal uses Drizzle ORM with Cloudflare D1 (SQLite):

### Initial Setup
1. Create D1 database: `wrangler d1 create onnepal-db`
2. Update `wrangler.jsonc` with database ID
3. Generate migrations: `npm run db:generate`
4. Apply to D1: `wrangler d1 execute onnepal-db --file=./drizzle/0000_initial.sql`

### Schema Location
- Schema definition: `src/lib/db/schema.ts`
- Database queries: `src/lib/db/queries/` (organized by entity)
- Drizzle config: `drizzle.config.ts`

### Adding New Tables/Columns
1. Modify `src/lib/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Apply migration with `wrangler d1 execute`

### Key Database Tables
- `users` - User accounts with roles (user, moderator, admin)
- `posts` - Articles with status (pending, approved, rejected, published)
- `upvotes` - Vote tracking (composite primary key: userId + postId)
- `moderation_actions` - Audit log for moderation decisions
- `tags` - Content categorization
- `post_tags` - Many-to-many relationship
- `comments` - Nested comments (optional feature)

## Authentication Flow

Uses JWT-based authentication with httpOnly cookies:

1. **Signup/Login**: `/api/auth/signup` or `/api/auth/login`
   - Password hashed with bcrypt
   - JWT token generated and set in httpOnly cookie
   - Token payload: userId, email, username, role

2. **Session Management**:
   - `getSession()` in server components/API routes
   - Token expires after 7 days
   - Logout clears cookie: `/api/auth/logout`

3. **Protected Routes**:
   - Check session in page components
   - Redirect to `/login` if unauthorized
   - Moderator/admin routes check role

## Content Moderation Workflow

1. User submits post → status: `pending`
2. Appears in `/moderate` for moderators/admins
3. Moderator approves → status: `published`, sets publishedAt
4. Moderator rejects → status: `rejected`
5. Auto-approve trusted users (future feature)

## Upvote & Featured Posts Algorithm

- Users upvote posts via `/api/posts/[slug]/upvote`
- Duplicate votes prevented by composite PK in upvotes table
- Featured posts query: `status='published'` ordered by upvoteCount DESC
- Future enhancement: Time-decay scoring (newer posts weighted higher)

## Image Upload (R2)

- Endpoint: `/api/upload`
- Validates: file type, size (5MB max)
- Stores in R2 with unique filename
- Returns URL for use in posts
- Note: Configure R2 custom domain or public access for production

## Development Workflow

1. Make schema changes in `src/lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Test locally with `npm run dev`
4. Apply to production D1 before deploying
5. Deploy: `npm run deploy`

## Important Notes

- All API routes use Edge runtime for Cloudflare Workers
- `getCloudflareContext()` provides access to D1, R2, KV bindings
- Server components must use `export const runtime = 'edge'`
- JWT_SECRET must be set as Wrangler secret for production
- First admin user must be created manually via D1 SQL
