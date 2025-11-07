// Cloudflare environment bindings
export interface CloudflareEnv extends Record<string, unknown> {
  DB: D1Database;
  IMAGES: R2Bucket;
  UPVOTE_THRESHOLD_FOR_FEATURE: string;
  POSTS_PER_PAGE: string;
  JWT_SECRET: string;
}
