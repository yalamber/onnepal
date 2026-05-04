import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const COOKIE = 'onnepal-city';

/**
 * URL-safe slug for city pages: "Lalitpur" → "lalitpur", "Bharatpur Metro" → "bharatpur-metro".
 */
export function slugFromCity(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Reverse a slug to the canonical proper-case city name we store in the DB.
 * "lalitpur" → "Lalitpur", "bharatpur-metro" → "Bharatpur Metro".
 *
 * The DB stores city names in proper case (e.g. classifieds.city = 'Kathmandu'),
 * so this is what we feed back into our equality filters.
 */
export function cityFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

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
