import { env } from "cloudflare:workers";
import type { SendEmailBinding } from "@/types/cloudflare";

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

/**
 * Returns the Cloudflare Email Sending binding, or null when it's not bound
 * (local dev without binding, or before the wrangler config is deployed).
 * Callers should fall back gracefully when null.
 */
export function getEmailBinding(): SendEmailBinding | null {
  const e = env as { EMAIL?: SendEmailBinding };
  return e.EMAIL ?? null;
}
