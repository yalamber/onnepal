import type { CloudflareEnv } from '@/types/cloudflare';

export async function getCloudflareEnv(): Promise<CloudflareEnv> {
  // In Cloudflare Workers, bindings are available on the global scope
  // via the env passed to the fetch handler. With vinext + @cloudflare/vite-plugin,
  // bindings are accessible as global properties.
  const env = (globalThis as unknown as { DB: D1Database; IMAGES: R2Bucket; JWT_SECRET: string });
  return env as unknown as CloudflareEnv;
}

export async function getD1Database(): Promise<D1Database> {
  const env = await getCloudflareEnv();
  return env.DB;
}

export async function getR2Bucket(): Promise<R2Bucket> {
  const env = await getCloudflareEnv();
  return env.IMAGES;
}
