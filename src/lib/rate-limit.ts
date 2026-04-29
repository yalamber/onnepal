import type { D1Database } from '@cloudflare/workers-types';

const RATE_CONFIGS: Record<string, { table: string; column: string }> = {
  'classified:create': { table: 'classifieds', column: 'user_id' },
  'job:create': { table: 'jobs', column: 'user_id' },
  'event:create': { table: 'events', column: 'user_id' },
  'lost-found:create': { table: 'lost_found', column: 'user_id' },
  'comment:create': { table: 'comments', column: 'user_id' },
  'place:create': { table: 'places', column: 'user_id' },
  'message:send': { table: 'messages', column: 'sender_id' },
  'review:create': { table: 'reviews', column: 'business_id' },
};

export async function checkRateLimit(
  d1: D1Database,
  action: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const config = RATE_CONFIGS[action];
  if (!config) return { allowed: true, remaining: limit };

  const windowStart = Math.floor(Date.now() / 1000) - windowSeconds;

  const result = await d1
    .prepare(`SELECT count(*) as count FROM ${config.table} WHERE ${config.column} = ? AND created_at > ?`)
    .bind(identifier, windowStart)
    .first<{ count: number }>();

  const count = result?.count ?? 0;
  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count),
  };
}

export function tooManyRequests(windowSeconds: number) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(windowSeconds),
      },
    },
  );
}
