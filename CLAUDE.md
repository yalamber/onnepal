# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OnNepal.com** is Nepal's premier Yellow Pages and Classifieds platform. It combines three products:

1. **Business directory with vanity URLs** — every business gets `name.onnepal.com` hosting a single-page site with links, products, menu, gallery, announcements, reviews, team, FAQ, bookings.
2. **Public directory** at `/directory` — browse/search/filter businesses by category and location.
3. **Classifieds** at `/classifieds` — Craigslist-style buy/sell/rent/services listings with categories and location filters.

**Vision**: The best Yellow Pages and classifieds platform for Nepal.

## Tech Stack

- **Framework**: Next.js 15.4 App Router + Vite 8 + vinext (Cloudflare Workers adapter)
- **Runtime**: React 19 on Cloudflare Workers (edge)
- **DB**: Drizzle ORM on Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 for images (bucket `onnepal-images`), served publicly at `https://images.onnepal.com/{key}`
- **Auth**: JWT via `jose` library (HS256) in httpOnly cookies; bcryptjs for passwords
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin
- **Validation**: Zod v4
- **Language**: TypeScript 5

## Common Commands

```bash
npm run dev          # vite dev
NODE_ENV=production npm run build   # production build (use this to verify CI)
npm run deploy       # vinext deploy --skip-build
npm run db:generate  # drizzle migration from schema.ts
npm run lint         # eslint
```

## Architecture

### Multi-business model (important)

Users and businesses are **separate tables**. One user can own up to 5 businesses.
- `users` table: email, password, displayName, onboardingStep
- `businesses` table: subdomain, businessName, category, colors, modules, etc. (foreign key `userId`)
- JWT payload is `{ userId, email }` only — **no subdomain** (user may have many businesses)
- Active business is tracked client-side in `localStorage.activeBusinessId`
- `useActiveBusiness()` hook (from `src/app/dashboard/layout.tsx`) supplies `{ user, business, businesses, setBusiness }` to all dashboard pages

### Business API route pattern

Every `/api/business/*` route takes `?businessId=<id>` in the query and validates ownership using the helper:

```ts
// src/lib/helpers/business-auth.ts
const auth = await getAuthenticatedBusiness(request);
if (!auth.ok) return auth.response;   // 401/403 or 400
const { user, business } = auth;       // both guaranteed
```

Client calls always include it: `fetch(\`/api/business/products?businessId=${business.id}\`)`.

### Module enable/disable system

Each business has `enabledModules` — a JSON string array of module keys (`"products"`, `"menu"`, `"gallery"`, etc.). The public site renders a section only if its module is enabled.

Dashboard section pages show an inline toggle at the top via `<ModuleToggle moduleKey="..." label="..." businessId={business.id} enabledModules={business.enabledModules} />`. Toggling PATCHes `/api/business/profile` to flip the key.

### Image upload flow

1. Client POSTs a `File` to `/api/upload` → worker uploads to R2 and returns `{ key: "<userId>/<uuid>.<ext>" }`.
2. **Store the key only in the DB** — never the full URL.
3. At render time call `imageUrl(key)` from `src/components/image-upload.tsx`:
   ```ts
   imageUrl(key) // → "https://images.onnepal.com/<key>"
   imageUrl("http://...")  // pass-through
   imageUrl(null) // → null
   ```
4. Zod validators for image fields use `z.string().max(500).nullish()` — **not** `z.string().url()` (keys aren't URLs).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/            # signup, login, logout, me
│   │   ├── subdomain/       # availability check
│   │   ├── business/        # profile, links, announcements, products,
│   │   │                    # menu, gallery, offers, reviews, team, faq,
│   │   │                    # bookings, ctas, publish
│   │   ├── directory/       # public directory listing API
│   │   ├── classifieds/     # classifieds CRUD
│   │   ├── admin/           # moderation endpoints
│   │   ├── site/            # public business page data API
│   │   ├── upload/          # R2 image upload (returns {key})
│   │   └── images/          # on-the-fly image optimization via worker
│   ├── site/[subdomain]/    # Public business page (server-rendered)
│   ├── directory/           # Public directory + category pages
│   ├── classifieds/         # Browse, category/[slug], post/new, [slug] detail
│   ├── admin/               # Admin panel (businesses, classifieds, users)
│   ├── onboarding/          # 3-step setup wizard
│   ├── create-business/     # Add additional business (up to 5)
│   ├── dashboard/
│   │   ├── layout.tsx       # DashboardContext provider, sidebar, business switcher
│   │   ├── page.tsx         # Overview
│   │   ├── account/         # User profile + password
│   │   ├── settings/        # Business profile + theme palette
│   │   ├── links/           # Social links CRUD
│   │   ├── products/        # Products (with edit + photo + availability toggle)
│   │   ├── menu/            # Restaurant menu (categories, items, photos)
│   │   ├── gallery/         # Photo gallery
│   │   ├── announcements/   # Pinnable announcements
│   │   ├── offers/          # Special offers / promotions
│   │   ├── reviews/         # View submitted reviews
│   │   ├── team/            # Team members with bios
│   │   ├── faq/             # FAQ entries
│   │   ├── bookings/        # Booking inquiries
│   │   └── qr-sticker/      # Printable QR code with subdomain
│   ├── login/
│   ├── signup/              # Signup with subdomain claim
│   ├── layout.tsx           # Root layout (Geist fonts)
│   ├── page.tsx             # Homepage
│   ├── globals.css
│   └── icon.svg             # Favicon (excluded from subdomain middleware)
├── components/
│   ├── navbar.tsx           # Main nav (hidden on subdomain pages)
│   ├── subdomain-checker.tsx
│   ├── business-page.tsx    # Public subdomain page renderer (all sections)
│   ├── business-card.tsx    # Directory card
│   ├── cover-reposition.tsx # Facebook-style drag-to-reposition cover image
│   ├── image-upload.tsx     # ImageUpload + imageUrl(key) helper
│   ├── module-toggle.tsx    # Inline enable/disable toggle for section pages
│   ├── review-form.tsx      # Public review submission form
│   ├── scroll-animate.tsx
│   └── ui/                  # shadcn/Radix primitives
├── lib/
│   ├── auth/                # jwt.ts (jose), session.ts, middleware.ts, password.ts
│   ├── helpers/
│   │   └── business-auth.ts # getAuthenticatedBusiness(request) helper
│   ├── db/
│   │   ├── schema.ts        # All Drizzle tables
│   │   ├── index.ts
│   │   └── queries/         # users, businesses, links, products, menu, gallery,
│   │                        # announcements, offers, reviews, team, faq, bookings,
│   │                        # ctas, classifieds, directory, analytics
│   ├── validators/          # Zod schemas
│   ├── themes.ts            # 10 curated business-page color palettes
│   ├── cloudflare.ts        # Bindings accessors (DB, IMAGES, JWT_SECRET)
│   └── utils.ts
├── middleware.ts            # Subdomain routing (skips /assets, /_next, /_vinext, /api, /icon.svg)
└── types/cloudflare.ts
worker/
└── index.ts                 # Worker entry (image optimization + vinext delegate)
vite.config.ts               # base: "https://onnepal.com" in prod
wrangler.jsonc               # D1, R2, routes, assets bindings
```

## Database Schema (`src/lib/db/schema.ts`)

- `users` — email, password, displayName, onboardingStep
- `businesses` — subdomain, businessName, category, description, logoUrl, coverImageUrl,
  coverPosition, phone, address, businessHours (JSON), whatsappNumber, mapAddress,
  bookingEnabled, **enabledModules** (JSON), primaryColor, accentColor, isPublished
- `social_links` — platform, url, label, order
- `products` — name, description, price, category, imageUrl, **isAvailable**
- `menu_items` — category, name, description, price, imageUrl, isAvailable
- `gallery_images` — imageUrl, caption
- `announcements` — title, content, isPinned, expiresAt
- `special_offers` — title, description, discount, validUntil
- `reviews` — rating, author, content, isApproved
- `team_members` — name, role, bio, imageUrl
- `faqs` — question, answer
- `bookings` — customer info + requested date/time + message (inquiries)
- `cta_buttons` — label, url, style
- `classifieds` — title, description, price, category, location, images, status
- `page_views` — analytics

All business-owned tables have FK `business_id` (not `user_id`) and are indexed.

## Authentication

1. **Signup**: email + password + businessName + subdomain claim → creates user + first business → JWT cookie
2. **Login**: email + password → JWT cookie, redirects based on onboarding state
3. **Session**: `getSession()` reads `auth_token` httpOnly cookie, verifies with `jose`
4. **Token**: `{ userId, email }`, 7-day expiry, signed HS256

**Do not use `jsonwebtoken`** — it's not Workers-compatible. Always use `jose`.

## Subdomain Routing

`src/middleware.ts` extracts subdomain from `Host` header and rewrites to `/site/[subdomain]`. Skip list: reserved names (`www`, `api`, `admin`, etc.), asset paths (`/assets/`, `/_next/`, `/_vinext/`, `/api/`, `/icon.svg`).

- **Local dev**: `mybusiness.localhost:3000`
- **Prod**: wildcard CNAME `*.onnepal.com → onnepal.com`
- **Prod assets**: Vite `base: "https://onnepal.com"` so subdomain pages load JS/CSS from main domain

## Cloudflare Configuration

- D1: `onnepal-db` bound as `DB`
- R2: `onnepal-images` bound as `IMAGES`, public at `https://images.onnepal.com/{key}`
- Routes: `*.onnepal.com/*` and `onnepal.com/*`
- Secret: `JWT_SECRET` (set via `wrangler secret put JWT_SECRET`)
- Auto-deploy on push to main via Cloudflare Git integration

## Design System

The dashboard has converged on a **minimal black-and-white aesthetic**:
- Primary action: `bg-gray-950 text-white hover:bg-gray-800` (flat, no gradients, no shadows)
- Cards: `border border-gray-200 rounded-lg` (no shadow)
- Empty states: `border-2 border-dashed border-gray-200`
- Inputs: `h-9`, `border-gray-200`, neutral focus ring (`focus:ring-gray-950/10`)
- Icons: lucide-react, `text-gray-400` defaults
- Spinners: `text-gray-400`
- Typography: Geist Sans

**The user-facing public business page** still uses the business's chosen `primaryColor`/`accentColor` from their selected theme palette — those are dynamic.

Older files (e.g. `settings`, some public pages) may still have indigo accents — migrate them toward the neutral palette when you touch them.

### Theme palettes (`src/lib/themes.ts`)

10 curated palettes (Ocean, Forest, Sunset, Berry, Rose, Slate, Midnight, Coffee, Teal, Coral) replace per-color pickers. Default: Ocean.

## Common Gotchas

- **Zod for nullable DB fields**: use `.nullish()` (accepts null and undefined). `.optional()` alone rejects the `null` the DB returns.
- **Image src in DB**: store the R2 key only, wrap with `imageUrl(key)` at render time. Validator is `z.string().max(500)`, not `.url()`.
- **Business API routes**: always need `?businessId=...`. Use `getAuthenticatedBusiness()` to check ownership.
- **Active business in dashboard**: read from `useActiveBusiness()`, not from a fetch — the layout already loads it.
- **Refetch on business change**: section pages should `useEffect(() => { fetchX(); }, [business])` so switching business reloads data.
- **Icon.svg**: must be in middleware skip list AND matcher regex or favicons 404 on subdomains.
- **Classifieds form null handling**: empty fields send `null`; schema must use `.nullish()`.

## Development Workflow

1. Modify `src/lib/db/schema.ts`
2. `npm run db:generate`
3. `wrangler d1 execute onnepal-db --file=./drizzle/XXXX.sql` (and `--remote` for prod)
4. Test: `npm run dev`
5. Verify: `NODE_ENV=production npm run build`
6. Push to main → auto-deploys

## Git Workflow

- Development branch: `claude/update-website-design-a6zzi` (per agent instructions)
- Commit format: HEREDOC body, ending with a `https://claude.ai/code/...` session link
- Do not skip hooks, do not force-push, do not amend published commits

## Roadmap

### Phase 1 (shipped) — Yellow Pages core
- Vanity subdomain pages with 10+ content sections and module toggles
- Public directory + category pages
- Dashboard with multi-business switcher
- Admin moderation panel

### Phase 2 (shipped foundation, expanding) — Classifieds
- Post ads with photos, price, category, location
- Category + subcategory browsing
- Contact via phone/WhatsApp

### Phase 3 — Growth
- Featured/promoted listings (paid)
- SMS verification for businesses
- Full-text search across directory + classifieds
- Email/SMS notifications for bookings and reviews
- Mobile app (PWA)
- Advanced analytics
