import { NextRequest, NextResponse } from 'next/server';
import { NEPAL_CITIES } from '@/lib/nepal-cities';

/**
 * Resolves the request's apparent city from Cloudflare's geo headers and
 * returns it ONLY if it's one of our known NEPAL_CITIES. We don't trust the
 * raw header value for filtering — the city must be in our list before we'd
 * suggest it as a switch.
 *
 * Cloudflare sets cf-ipcity (proper case, e.g. "Kathmandu") at the edge for
 * all paid Workers customers; on free plans the header may be missing.
 */
export async function GET(request: NextRequest) {
  // Try cf-ipcity (most consistent), then cf-region as a coarser fallback.
  const rawCity = request.headers.get('cf-ipcity') ?? '';
  const country = request.headers.get('cf-ipcountry') ?? '';

  const city = rawCity.trim();
  let matched: string | null = null;
  if (city.length > 0) {
    const lc = city.toLowerCase();
    const hit = NEPAL_CITIES.find((c) => c.name.toLowerCase() === lc);
    if (hit) matched = hit.name;
  }

  const res = NextResponse.json({
    detectedCity: matched,
    rawCity: city || null,
    country: country || null,
  });
  // Don't cache — geo varies per visitor.
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}
