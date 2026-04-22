import { env } from "cloudflare:workers";

export function getD1Database(): D1Database {
  return (env as { DB: D1Database }).DB;
}

export function getR2Bucket(): R2Bucket {
  return (env as { IMAGES: R2Bucket }).IMAGES;
}

export function getJwtSecret(): string {
  const secret = (env as { JWT_SECRET: string }).JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Run: wrangler secret put JWT_SECRET');
  }
  return secret;
}
