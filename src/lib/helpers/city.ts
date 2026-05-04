import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const COOKIE = 'onnepal-city';

/**
 * Resolve the user's preferred city for filtering.
 * Priority: explicit URL param > cookie > undefined.
 *
 * Pass either a NextRequest (in API routes) or use the awaited cookies() helper
 * (in server components/pages — pass `null` for `request`).
 */
export async function resolveCity(request: NextRequest | null, urlCity?: string | null): Promise<string | undefined> {
  // URL takes precedence (someone sharing a link with ?city= overrides their cookie)
  if (urlCity && urlCity.trim().length > 0) return urlCity.trim();

  if (request) {
    const c = request.cookies.get(COOKIE)?.value;
    if (c && c.trim().length > 0) return decodeURIComponent(c.trim());
  } else {
    try {
      const store = await cookies();
      const c = store.get(COOKIE)?.value;
      if (c && c.trim().length > 0) return decodeURIComponent(c.trim());
    } catch {}
  }
  return undefined;
}
