# OnNepal - Quick Start Guide

## 🎉 Your Application is Deployed!

**Live URL**: https://onnepal.yalamber.workers.dev

## ✅ What's Been Completed

1. ✅ Application built and deployed to Cloudflare Workers
2. ✅ D1 Database created with all tables (users, posts, tags, upvotes, comments, etc.)
3. ✅ R2 Bucket created for image uploads
4. ✅ All build errors fixed (React Markdown, ESLint, TypeScript)
5. ✅ Cloudflare OpenNext compatibility configured

## 🔧 Final Configuration (2 Steps)

Due to authentication token expiration, you need to complete these 2 steps manually:

### Step 1: Set JWT Secret (Required)

Generate a secure secret and set it:

```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Set it as a Cloudflare secret
npx wrangler secret put JWT_SECRET
# Paste the generated secret when prompted
```

### Step 2: Create Admin User (Required)

**Option A: Using Cloudflare Dashboard (Easiest)**

1. Go to https://dash.cloudflare.com
2. Navigate to: Workers & Pages → D1
3. Click on `onnepal-db`
4. Go to the **Console** tab
5. Paste and execute this SQL:

```sql
INSERT INTO users (
  id,
  email,
  username,
  password_hash,
  display_name,
  role,
  is_banned,
  created_at,
  updated_at
) VALUES (
  'admin-71271f690e365af6',
  'admin@onnepal.com',
  'admin',
  '$2b$10$f9U1pPoKra7PA20CehPSZubCtLTNQ1TZRwrxOnb422Jh.99PP3lfW',
  'Administrator',
  'admin',
  0,
  unixepoch(),
  unixepoch()
);
```

**Option B: Using Wrangler CLI**

```bash
npx wrangler d1 execute onnepal-db --remote --command="INSERT INTO users (id, email, username, password_hash, display_name, role, is_banned, created_at, updated_at) VALUES ('admin-71271f690e365af6', 'admin@onnepal.com', 'admin', '\$2b\$10\$f9U1pPoKra7PA20CehPSZubCtLTNQ1TZRwrxOnb422Jh.99PP3lfW', 'Administrator', 'admin', 0, unixepoch(), unixepoch());"
```

## 🔑 Admin Credentials

After creating the admin user, log in with:

- **Email**: admin@onnepal.com
- **Username**: admin
- **Password**: AdminPass2024!

## 🚀 Start Using OnNepal

1. Visit https://onnepal.yalamber.workers.dev
2. Click "Login" in the top right
3. Enter the admin credentials
4. Start creating and moderating content!

## 📝 What You Can Do

### As Admin
- ✍️  Create and publish posts about Nepal
- ✅ Moderate submitted posts (approve/reject)
- 👥 Manage users and roles
- 📊 View dashboard statistics
- 🏷️  Create and manage tags

### As Regular User
- 📖 Read published articles
- 👍 Upvote posts you like
- ✍️  Submit posts for moderation
- 💬 Comment on posts (when implemented)

## 🗂️ Database Schema

Your database includes these tables:
- **users** - User accounts and authentication
- **posts** - Articles with status tracking
- **tags** - Content categorization
- **post_tags** - Tag associations
- **upvotes** - Vote tracking
- **moderation_actions** - Moderation audit log
- **comments** - User comments (optional feature)

## 🛠️ Development Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy

# View live logs
npx wrangler tail onnepal

# Database commands
npm run db:generate  # Generate migrations
npx wrangler d1 execute onnepal-db --remote --command="SELECT * FROM users;"
```

## 📚 Project Structure

```
onnepal/
├── src/
│   ├── app/              # Next.js pages and API routes
│   │   ├── api/          # Backend API endpoints
│   │   ├── login/        # Authentication pages
│   │   ├── dashboard/    # User dashboard
│   │   ├── moderate/     # Moderation interface
│   │   ├── posts/        # Post pages
│   │   └── submit/       # Post submission
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and database
│   └── types/            # TypeScript definitions
├── drizzle/              # Database migrations
├── scripts/              # Helper scripts
└── wrangler.jsonc        # Cloudflare configuration
```

## 🔗 Important Links

- **Application**: https://onnepal.yalamber.workers.dev
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **D1 Database**: https://dash.cloudflare.com → Workers & Pages → D1 → onnepal-db
- **R2 Bucket**: https://dash.cloudflare.com → R2 → onnepal-images
- **Worker Logs**: `npx wrangler tail onnepal`

## 🆘 Troubleshooting

### Can't Login?
1. Verify JWT_SECRET is set: `npx wrangler secret list`
2. Check admin user exists: Use D1 Console to query `SELECT * FROM users WHERE role='admin';`
3. Try password reset (create new user with different email)

### Database Errors?
- Verify tables exist: `npx wrangler d1 execute onnepal-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"`
- Check database ID in `wrangler.jsonc` matches your D1 database

### Upload Not Working?
- R2 bucket `onnepal-images` should be created
- Check binding in `wrangler.jsonc`
- Configure public access in Cloudflare Dashboard if needed

## 🎨 Customization

### Change Branding
- Update logo and colors in `src/components/navbar.tsx`
- Modify theme in `src/app/globals.css`

### Add Features
- Implement email notifications
- Add social sharing
- Enable comments
- Add search functionality
- Integrate analytics

## 📞 Support

For issues or questions:
1. Check `DEPLOYMENT_STEPS.md` for detailed setup
2. Review `CLAUDE.md` for project architecture
3. Check Cloudflare Workers documentation
4. View deployment logs: `npx wrangler tail onnepal`

---

**🎊 Congratulations! Your citizen journalism platform is live!**

Start sharing stories about Nepal with the world. 🇳🇵
