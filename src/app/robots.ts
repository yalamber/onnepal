// Crawl rules for OnNepal. Explicit about AI crawlers (allow most),
// reserve write-API and authenticated surfaces, and point to /llms.txt
// (and /llms-full.txt) for agent-friendly metadata that goes beyond what
// robots.txt itself can express.

export default function robots() {
  // Surfaces we never want crawled regardless of crawler.
  // Note we no longer disallow `/api/` wholesale — public GETs are
  // discoverable, and write endpoints are auth-protected anyway.
  const PRIVATE = ['/dashboard/', '/admin/', '/onboarding/', '/api/auth/', '/api/upload', '/(auth)/'];

  // Named AI bots get an explicit allow so operators can tell at a glance
  // that we're agent-friendly. Same effective ruleset as the wildcard.
  const AI_BOTS = [
    'GPTBot',
    'ClaudeBot',
    'PerplexityBot',
    'Applebot-Extended',
    'Google-Extended',
    'CCBot',
    'cohere-ai',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE,
      },
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE,
      })),
    ],
    sitemap: 'https://onnepal.com/sitemap.xml',
    host: 'https://onnepal.com',
  };
}
