import { NextRequest, NextResponse } from 'next/server';

const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'admin', 'mail', 'blog', 'help', 'support', 'status',
  'app', 'dashboard', 'cdn', 'static', 'images', 'dev', 'staging', 'test',
]);

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Extract subdomain: e.g., "mybusiness.onnepal.com" → "mybusiness"
  // In dev: "mybusiness.localhost:3000" → "mybusiness"
  const parts = hostname.split('.');
  let subdomain: string | null = null;

  if (parts.length >= 3) {
    // e.g., mybusiness.onnepal.com
    subdomain = parts[0];
  } else if (parts.length === 2 && parts[1].startsWith('localhost')) {
    // e.g., mybusiness.localhost:3000
    subdomain = parts[0];
  }

  // Skip if no subdomain, reserved, or accessing internal paths
  if (
    !subdomain ||
    RESERVED_SUBDOMAINS.has(subdomain) ||
    subdomain === 'onnepal' ||
    subdomain === 'localhost'
  ) {
    return NextResponse.next();
  }

  // Skip API routes and static assets on subdomains
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Rewrite subdomain requests to the site route
  url.pathname = `/site/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon\\.ico).*)'],
};
