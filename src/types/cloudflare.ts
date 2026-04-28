// Cloudflare environment bindings
export interface CloudflareEnv extends Record<string, unknown> {
  DB: D1Database;
  IMAGES: R2Bucket;
  JWT_SECRET: string;
  VINEXT_CACHE: KVNamespace;
}
