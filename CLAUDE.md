# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OnNepal.com** is a business link-sharing platform for Nepal. Businesses register a subdomain (`businessname.onnepal.com`) and get a mini single-page website with social links, products, announcements, contact details, and CTAs. Think Linktree meets Carrd, localized for Nepal.

### Core Features
- **Subdomain-based pages**: Each business gets `name.onnepal.com`
- **Social links**: Connect Facebook, Instagram, WhatsApp, TikTok, etc.
- **Product showcase**: Display products with images, prices, descriptions
- **Announcements**: Share news, offers, updates (pinnable, expirable)
- **CTA buttons**: Configurable call-to-action buttons (Order, Book, Call)
- **Contact info**: Phone, address, business hours
- **Brand customization**: Primary/accent colors per business
- **Onboarding wizard**: 3-step setup gets page live in minutes

### Technical Foundation
Next.js 15.4 on Cloudflare Workers via OpenNext. App Router, TypeScript, React 19, Tailwind CSS v4. Subdomain routing via Next.js middleware.

## Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Runtime**: React 19.1.0
- **ORM**: Drizzle ORM with Cloudflare D1 (SQLite)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Validation**: Zod v4
- **Deployment**: Cloudflare Workers via @opennextjs/cloudflare
- **Storage**: Cloudflare R2 for images
- **Auth**: JWT with httpOnly cookies, bcryptjs
- **Language**: TypeScript 5

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # signup, login, logout, me
│   │   ├── subdomain/     # check availability
│   │   ├── business/      # profile, links, announcements, products, ctas, publish
│   │   ├── site/          # public page data API
│   │   └── upload/        # R2 image upload
│   ├── site/[subdomain]/  # Public business page (server component)
│   ├── onboarding/        # 3-step setup wizard
│   ├── dashboard/         # Management hub
│   │   ├── links/         # Social links CRUD
│   │   ├── products/      # Products CRUD
│   │   ├── announcements/ # Announcements CRUD
│   │   └── settings/      # Profile, colors, business info
│   ├── login/             # Login page
│   ├── signup/            # Signup with subdomain claim
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page with subdomain checker
│   └── globals.css
├── components/
│   ├── navbar.tsx           # Main navigation (hidden on subdomain pages)
│   ├── subdomain-checker.tsx # Real-time subdomain availability input
│   ├── business-page.tsx    # Public page renderer
│   └── ui/                  # Shadcn/Radix UI primitives
├── lib/
│   ├── auth/
│   │   ├── jwt.ts           # Token generation/verification
│   │   ├── session.ts       # Cookie management
│   │   ├── middleware.ts    # Route protection HOF
│   │   └── password.ts      # bcryptjs hashing
│   ├── db/
│   │   ├── schema.ts        # Drizzle table definitions
│   │   ├── index.ts         # DB initialization
│   │   └── queries/
│   │       ├── users.ts     # User/business CRUD
│   │       ├── links.ts     # Social links CRUD
│   │       ├── announcements.ts
│   │       ├── products.ts
│   │       ├── ctas.ts
│   │       └── analytics.ts # Page view tracking
│   ├── validators/
│   │   ├── business.ts      # Zod schemas for all business data
│   │   └── subdomain.ts     # Subdomain validation + reserved names
│   ├── cloudflare.ts        # Context/binding accessors
│   └── utils.ts             # Utility functions
├── middleware.ts             # Subdomain routing
└── types/
    └── cloudflare.ts        # CloudflareEnv type
```

## Common Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build for production
npm run deploy       # Build and deploy to Cloudflare
npm run db:generate  # Generate Drizzle migration from schema
npm run lint         # Run ESLint
```

## Subdomain Routing

`src/middleware.ts` intercepts all requests, extracts subdomain from `Host` header, and rewrites to `/site/[subdomain]`. Reserved names (www, api, admin, etc.) pass through to main app.

**Local dev**: Use `mybusiness.localhost:3000` to test subdomain pages.

**Production DNS**: Requires wildcard CNAME `*.onnepal.com -> onnepal.com` in Cloudflare DNS.

## Database Schema

- `users` - Business owners (includes profile: subdomain, businessName, category, colors, etc.)
- `social_links` - Platform links (facebook, instagram, whatsapp, etc.) with ordering
- `announcements` - Pinnable, expirable business announcements
- `products` - Product showcase with pricing and ordering
- `cta_buttons` - Call-to-action buttons (primary/secondary/outline styles)
- `page_views` - Basic analytics (view timestamps + referrers)

All tables indexed on `user_id` foreign key.

## Authentication Flow

1. **Signup**: Email + password + business name + subdomain claim → JWT cookie
2. **Login**: Email + password → JWT cookie, redirect based on onboarding step
3. **Session**: `getSession()` reads JWT from `auth_token` httpOnly cookie
4. **Token payload**: `{ userId, email, subdomain }`

## User Flow

1. Landing page → subdomain checker → signup with subdomain claim
2. Onboarding wizard (3 steps): Welcome → Business details → Social links → Publish
3. Dashboard → manage links, products, announcements, settings
4. Public page live at `subdomain.onnepal.com`

## Onboarding Steps

Track via `users.onboardingStep` (0-4):
- 0: Not started
- 1: Account created (redirect to onboarding)
- 2: Business details saved
- 3: Links added
- 4: Complete (site published, redirect to dashboard)

## Cloudflare Configuration

- **D1**: `onnepal-db` database bound as `DB`
- **R2**: `onnepal-images` bucket bound as `IMAGES`
- **Routes**: `*.onnepal.com` and `onnepal.com/*`
- **Secret**: `JWT_SECRET` (set via `wrangler secret put JWT_SECRET`)

## Development Workflow

1. Modify schema in `src/lib/db/schema.ts`
2. Run `npm run db:generate`
3. Apply migration: `wrangler d1 execute onnepal-db --file=./drizzle/XXXX.sql`
4. Test locally with `npm run dev`
5. Deploy: `npm run deploy`
