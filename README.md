# OnNepal.com

Nepal's Yellow Pages and Classifieds platform. Built on Next.js 15 + Cloudflare Workers.

## What it is

Three products in one:

1. **Business vanity pages** — every business gets `name.onnepal.com` with a single-page site (social links, products, restaurant menu, gallery, announcements, offers, reviews, team, FAQ, bookings).
2. **Public directory** — browse and search businesses by category and location at `/directory`.
3. **Classifieds** — Craigslist-style buy/sell/rent/services listings at `/classifieds`.

## Tech

- Next.js 15.4 App Router + Vite 8 + vinext (Cloudflare Workers adapter)
- React 19 on Cloudflare Workers (edge runtime)
- Drizzle ORM + Cloudflare D1 (SQLite)
- Cloudflare R2 for images (public at `images.onnepal.com`)
- JWT auth via `jose` (HS256) in httpOnly cookies
- Tailwind CSS v4
- Zod v4 validators

## Getting started

```bash
npm install
npm run dev   # http://localhost:3000
```

Test a subdomain page locally: `http://mybusiness.localhost:3000`.

### Cloudflare setup

```bash
wrangler login
wrangler d1 create onnepal-db
wrangler r2 bucket create onnepal-images
wrangler secret put JWT_SECRET   # paste a 32+ byte random string

# apply the latest migration
wrangler d1 execute onnepal-db --file=./drizzle/<latest>.sql
```

Configure IDs in `wrangler.jsonc`.

### Scripts

```bash
npm run dev                            # dev server
NODE_ENV=production npm run build      # production build (use this for CI/verify)
npm run deploy                         # vinext deploy --skip-build
npm run db:generate                    # drizzle migration from schema
npm run lint
```

Auto-deploys on push to `main` via Cloudflare Git integration.

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing homepage + subdomain claim |
| `/signup`, `/login` | Auth |
| `/onboarding` | 3-step setup wizard |
| `/create-business` | Add additional business (up to 5 per user) |
| `/dashboard/*` | Multi-business management hub |
| `/directory` | Public business directory |
| `/classifieds` | Buy/sell listings |
| `/admin` | Moderation panel |
| `name.onnepal.com` | Public business page (via subdomain middleware → `/site/[subdomain]`) |

## Documentation

- [CLAUDE.md](./CLAUDE.md) — Architecture, conventions, gotchas (source of truth)
- [QUICK_START.md](./QUICK_START.md)
- [DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md)

## License

MIT
