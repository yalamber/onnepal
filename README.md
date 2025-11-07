# OnNepal.com - Citizen Journalism Portal

A lightweight, community-driven citizen journalism platform for Nepal. Built with Next.js 15 and deployed on Cloudflare Workers.

## 🌐 Live Application

**Production URL**: https://onnepal.yalamber.workers.dev

> ⚠️ **Important**: Complete the final setup steps below before using the application.

## 🚀 Features

- **User Authentication** - Secure JWT-based auth with role management
- **Post Creation** - Submit articles with Markdown support
- **Community Upvoting** - Vote on posts to determine featured content
- **Content Moderation** - Review and approve posts before publication
- **Featured Algorithm** - Top posts appear on homepage based on upvotes
- **User Dashboard** - Manage your posts and profile
- **Image Upload** - Store images in Cloudflare R2
- **Responsive Design** - Mobile-friendly interface

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4 with App Router
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare R2 for images
- **Cache**: Cloudflare KV
- **Runtime**: Cloudflare Workers (Edge)
- **Auth**: JWT with httpOnly cookies
- **Styling**: Tailwind CSS v4
- **Validation**: Zod

## 📦 Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/              # Utilities, database, auth
└── types/           # TypeScript types
```

## 🏁 Quick Start

> ✅ **Application is already deployed!** Follow Steps 1-2 below to complete the setup.

### Step 1: Set JWT Secret (Required)

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Set it as a Cloudflare secret
npx wrangler secret put JWT_SECRET
# Paste the generated secret when prompted
```

### Step 2: Create Admin User (Required)

**Option A: Using Cloudflare Dashboard (Recommended)**

1. Visit https://dash.cloudflare.com
2. Go to: Workers & Pages → D1 → `onnepal-db`
3. Click the **Console** tab
4. Execute this SQL:

```sql
INSERT INTO users (
  id, email, username, password_hash, display_name,
  role, is_banned, created_at, updated_at
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

**Login Credentials:**
- Email/Username: `admin` or `admin@onnepal.com`
- Password: `AdminPass2024!`

**Option B: Create Custom Admin User**

```bash
# Use the helper script
node scripts/create-admin.js your@email.com yourusername YourPassword123

# Follow the instructions to insert the user
```

### That's It!

Visit https://onnepal.yalamber.workers.dev and log in with your admin credentials.

---

## 📖 Full Setup Guide

### Prerequisites (For Local Development)

- Node.js 18+
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd onnepal
   npm install
   ```

2. **Set up Cloudflare resources**
   ```bash
   # Login to Cloudflare
   wrangler login

   # Create D1 database
   wrangler d1 create onnepal-db

   # Create R2 bucket
   wrangler r2 bucket create onnepal-images

   # Create KV namespace
   wrangler kv:namespace create CACHE
   ```

3. **Configure wrangler.jsonc**

   Update with your database ID and KV namespace ID from the commands above.

4. **Set JWT secret**
   ```bash
   # Generate a secret
   openssl rand -base64 32

   # Set as Wrangler secret
   wrangler secret put JWT_SECRET
   ```

5. **Set up database**
   ```bash
   # Generate migration
   npm run db:generate

   # Apply to D1
   wrangler d1 execute onnepal-db --file=./drizzle/0000_initial.sql
   ```

6. **Run locally**
   ```bash
   npm run dev
   ```

   Visit http://localhost:3000

7. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   ```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes ⚡
- **[DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md)** - Detailed deployment guide
- **[CLAUDE.md](./CLAUDE.md)** - Technical architecture guide
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete feature list

## 🗄️ Database Schema

- **users** - User accounts and authentication
- **posts** - Articles with status tracking
- **upvotes** - Vote system (prevents duplicates)
- **moderation_actions** - Moderation audit log
- **tags** - Content categorization
- **post_tags** - Post-tag relationships
- **comments** - Comment system (foundation)

## 🔐 User Roles

1. **User** - Can create posts and upvote
2. **Moderator** - Can approve/reject posts
3. **Admin** - Full access

### Creating First Admin

```bash
# Sign up via website, then promote via D1
wrangler d1 execute onnepal-db --command="UPDATE users SET role = 'admin' WHERE email = 'your@email.com'"
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run deploy       # Deploy to Cloudflare
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run db:generate  # Generate database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## 🌐 Key Routes

- `/` - Homepage with featured posts
- `/posts` - All published posts
- `/posts/[slug]` - Individual post view
- `/submit` - Create new post (auth required)
- `/moderate` - Moderation queue (moderator/admin)
- `/dashboard` - User dashboard (auth required)
- `/login` - User login
- `/signup` - User registration

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/posts/[slug]` - Get post
- `PATCH /api/posts/[slug]` - Update post
- `DELETE /api/posts/[slug]` - Delete post
- `POST /api/posts/[slug]/upvote` - Toggle upvote
- `GET /api/posts/featured` - Featured posts

### Moderation
- `GET /api/moderate/posts` - Pending posts
- `POST /api/moderate/posts/[id]` - Moderate post

### Upload
- `POST /api/upload` - Upload image to R2

## 🎨 Customization

### Upvote Threshold

Edit `wrangler.jsonc`:
```jsonc
"vars": {
  "UPVOTE_THRESHOLD_FOR_FEATURE": "10"
}
```

### Posts Per Page

Edit `wrangler.jsonc`:
```jsonc
"vars": {
  "POSTS_PER_PAGE": "20"
}
```

## 🚧 Future Enhancements

- [ ] Comment system UI
- [ ] Full-text search
- [ ] Tag filtering
- [ ] User profiles
- [ ] Email notifications
- [ ] Rich text editor
- [ ] Social sharing
- [ ] Analytics dashboard

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📧 Support

For issues or questions, please open a GitHub issue.
