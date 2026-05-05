# OnNepal Deployment - Final Setup Steps

The application has been successfully deployed to: **https://onnepal.yalamber.workers.dev**

## ✅ Completed Steps

1. ✅ Fixed React Markdown build error
2. ✅ Resolved all ESLint and TypeScript errors
3. ✅ Made application compatible with Cloudflare OpenNext
4. ✅ Created D1 database: `onnepal-db` (ID: e5470bfa-4bb2-46df-8783-3bc462a0b239)
5. ✅ Created R2 bucket: `onnepal-images`
6. ✅ Applied database migrations (all tables created)

## 📋 Remaining Manual Steps

### Step 1: Set JWT Secret

The JWT_SECRET needs to be set as a Cloudflare Workers secret:

```bash
# Run this command and enter a strong random secret when prompted
npx wrangler secret put JWT_SECRET
```

**Generate a secure secret:**
```bash
# Option 1: Using openssl
openssl rand -hex 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Create First Admin User

Since password hashing requires bcrypt, you'll need to create the first admin user manually:

**Method A: Using the Cloudflare Dashboard**
1. Go to https://dash.cloudflare.com
2. Navigate to Workers & Pages > D1
3. Select `onnepal-db`
4. Go to Console tab
5. Run the following SQL (after generating password hash):

```sql
-- First, generate a password hash using Node.js/bcrypt:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-password', 10, (e,h) => console.log(h));"

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
  'admin-' || lower(hex(randomblob(16))),
  'admin@onnepal.com',
  'admin',
  '$2b$10$...your-generated-hash-here...',
  'Administrator',
  'admin',
  0,
  unixepoch(),
  unixepoch()
);
```

**Method B: Using Wrangler CLI**
```bash
# Generate password hash first
npm install bcrypt
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourSecurePassword123', 10, (e,h) => console.log(h));"

# Then execute SQL
npx wrangler d1 execute onnepal-db --remote --command="INSERT INTO users (id, email, username, password_hash, display_name, role, is_banned, created_at, updated_at) VALUES ('admin-001', 'admin@onnepal.com', 'admin', '\$2b\$10\$YOUR_HASH_HERE', 'Administrator', 'admin', 0, unixepoch(), unixepoch());"
```

### Step 3: Verify Tables Were Created

Check that all tables exist:

```bash
npx wrangler d1 execute onnepal-db --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Expected tables:
- _cf_KV
- comments
- moderation_actions
- post_tags
- posts
- tags
- upvotes
- users

## 🎉 Access Your Application

Once the JWT secret is set and admin user is created:

1. Visit: https://onnepal.yalamber.workers.dev
2. Click "Login" or go to https://onnepal.yalamber.workers.dev/login
3. Use your admin credentials to log in
4. You'll have full access to:
   - Create posts
   - Moderate submissions
   - Manage users
   - View dashboard

## 🔧 Additional Configuration (Optional)

### Set up Custom Domain
```bash
# Add a custom domain via Cloudflare Dashboard or:
npx wrangler publish --routes="onnepal.com/*"
```

### Configure R2 Public Access
For the image upload feature to work properly:
1. Go to Cloudflare Dashboard > R2
2. Select `onnepal-images` bucket
3. Go to Settings > Public Access
4. Enable public access or set up a custom domain

### Enable Email Notifications (Future Enhancement)
The platform can be extended to send email notifications using:
- Cloudflare Email Routing
- SendGrid/Mailgun integration
- Resend API

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure `database_id` in `wrangler.jsonc` matches your D1 database ID
- Check that migrations were applied: `npx wrangler d1 execute onnepal-db --command="SELECT * FROM users LIMIT 1;"`

### JWT Errors
- Verify JWT_SECRET is set: `npx wrangler secret list`
- Make sure it's a strong, random string (at least 32 characters)

### Login Issues
- Verify admin user exists in database
- Check that password hash was generated correctly with bcrypt
- Ensure JWT_SECRET is set

## 📧 Email Sending (Cloudflare Email Service)

OnNepal uses Cloudflare's **Email Sending** Workers binding (public beta as of
April 2026) for transactional email — currently the password-reset flow.

### Prerequisites

1. **Workers Paid plan.** Email Sending is not on the free tier.
2. **A verified sender domain.** Without verification, every send call fails
   with `E_SENDER_NOT_VERIFIED` and the calling flow falls back to a no-op
   (the user just doesn't receive the email).

### One-time setup

1. **Verify `onnepal.com` for Email Sending:**
   - Cloudflare Dashboard → **Email** → **Email Sending** → **Domains** → **Add domain**.
   - Enter `onnepal.com`. The wizard prints SPF, DKIM (CNAME), and DMARC records.
2. **Add the DNS records** in your zone (Cloudflare DNS, since the zone is
   already on Cloudflare). Typical records:
   - `TXT @ "v=spf1 include:_spf.mx.cloudflare.net ~all"`
   - `CNAME cf-2024-***._domainkey  cf-2024-***._domainkey.cf-mail.net`
   - `TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@onnepal.com"`
3. Click **Verify** in the dashboard. Status flips to "Verified" within minutes.
4. **Allowed senders.** `wrangler.jsonc` restricts the binding to
   `noreply@onnepal.com`. To add more (e.g. `hello@onnepal.com`), edit
   `allowed_sender_addresses` and redeploy.

### Verify on production

```bash
curl -X POST https://onnepal.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"yalamber@mundhum.com"}'
```

Then check the inbox. Tail logs to see the underlying call:

```bash
npx wrangler tail onnepal
# look for "[email] sent" (success) or "[email] send failed" with cause.
```

### Local dev

`wrangler dev --local` does not actually deliver email; the binding may be
stubbed. The helper logs `[email] No EMAIL binding; skipping send.` instead
of throwing, so flows that depend on email don't crash in dev.

## 📚 Next Steps

1. **Create Content**: Log in and start submitting posts
2. **Test Moderation**: Submit posts and approve/reject them as moderator
3. **Customize**: Update branding, colors, and content in the codebase
4. **Monitor**: Use Cloudflare Analytics to track usage
5. **Scale**: The platform is ready to handle production traffic on Cloudflare's global network

## 🔗 Useful Links

- **Live Site**: https://onnepal.yalamber.workers.dev
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **D1 Database**: https://dash.cloudflare.com (Navigate to Workers & Pages > D1)
- **R2 Bucket**: https://dash.cloudflare.com (Navigate to R2)
- **Worker Logs**: `npx wrangler tail onnepal`

---

Need help? Check the project documentation in `CLAUDE.md` or open an issue.
