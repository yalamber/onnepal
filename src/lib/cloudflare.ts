import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { CloudflareEnv } from '@/types/cloudflare';

export async function getCloudflareEnv(): Promise<CloudflareEnv> {
  const context = await getCloudflareContext({ async: true });
  return context.env as CloudflareEnv;
}

export async function getD1Database(): Promise<D1Database> {
  const context = await getCloudflareContext({ async: true });
  const env = context.env as CloudflareEnv;
  return env.DB;
}

export async function getR2Bucket(): Promise<R2Bucket> {
  const context = await getCloudflareContext({ async: true });
  const env = context.env as CloudflareEnv;
  return env.IMAGES;
}
