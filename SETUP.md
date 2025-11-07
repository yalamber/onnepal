# OnNepal.com Setup Guide

This guide will help you set up and deploy the OnNepal citizen journalism portal.

## Prerequisites

- Node.js 18+ installed
- A Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

## Step 3: Create Cloudflare Resources

### Create D1 Database

```bash
wrangler d1 create onnepal-db
```

This will output a database ID. Copy it and update `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "onnepal-db",
    "database_id": "YOUR_DATABASE_ID_HERE"
  }
]
```

### Create R2 Bucket for Images

```bash
wrangler r2 bucket create onnepal-images
```

### Create KV Namespace for Caching

```bash
wrangler kv:namespace create CACHE
```

This will output a KV namespace ID. Update `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  {
    "binding": "CACHE",
    "id": "YOUR_KV_ID_HERE"
  }
]
```

## Step 4: Set Up Environment Variables

### Create a JWT Secret

```bash
wrangler secret put JWT_SECRET
```

When prompted, enter a long random string (at least 32 characters). You can generate one with:

```bash
openssl rand -base64 32
```

### For Local Development

Create a `.dev.vars` file in the root directory:

```env
JWT_SECRET=your-jwt-secret-here
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-database-id
CLOUDFLARE_D1_TOKEN=your-d1-token
```

## Step 5: Set Up Database Schema

### Generate Migration Files

```bash
npm run db:generate
```

### Apply Migrations to D1

You'll need to run the SQL from the generated migration file manually:

```bash
# Get the SQL from drizzle/0000_initial.sql
wrangler d1 execute onnepal-db --file=./drizzle/0000_initial.sql
```

Or use Drizzle Kit push (if configured with HTTP):

```bash
npm run db:push
```

### Create the First Admin User

You'll need to manually create an admin user. You can do this by:

1. Sign up through the website first (this creates a regular user)
2. Then update the user role in D1:

```bash
wrangler d1 execute onnepal-db --command="UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com'"
```

Or create a moderator:

```bash
wrangler d1 execute onnepal-db --command="UPDATE users SET role = 'moderator' WHERE email = 'your-email@example.com'"
```

## Step 6: Run Locally

```bash
npm run dev
```

The site will be available at http://localhost:3000

## Step 7: Deploy to Cloudflare Pages

```bash
npm run deploy
```

This will:
1. Build the Next.js application
2. Deploy to Cloudflare Pages via the OpenNext adapter

## Configuration Options

### Upvote Threshold for Featured Posts

In `wrangler.jsonc`, you can adjust:

```jsonc
"vars": {
  "UPVOTE_THRESHOLD_FOR_FEATURE": "10",  // Minimum upvotes to be featured
  "POSTS_PER_PAGE": "20"                   // Posts per page
}
```

### R2 Caching

To enable R2 incremental cache, edit `open-next.config.ts`:

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
```

## Database Management

### View Database in Studio

```bash
npm run db:studio
```

### Execute SQL Commands

```bash
wrangler d1 execute onnepal-db --command="SELECT * FROM users"
```

### Backup Database

```bash
wrangler d1 export onnepal-db --output=backup.sql
```

## Troubleshooting

### "Unauthorized" errors

- Make sure JWT_SECRET is set in Wrangler secrets
- Check that you're logged in with `wrangler whoami`

### Database not found

- Verify the database_id in wrangler.jsonc matches your D1 database
- Run `wrangler d1 list` to see your databases

### R2 images not loading

- Ensure the R2 bucket is created
- You may need to configure a custom domain for R2 or enable public access
- Update the URL pattern in `/api/upload/route.ts`

### Module resolution errors

- Make sure all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next`

## Production Checklist

- [ ] JWT_SECRET is set as a Wrangler secret
- [ ] D1 database is created and migrated
- [ ] R2 bucket is created
- [ ] KV namespace is created
- [ ] At least one admin user exists
- [ ] wrangler.jsonc has correct binding IDs
- [ ] Custom domain configured (optional)
- [ ] R2 public access or custom domain configured for images

## Support

For issues, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
