import { NextResponse } from 'next/server';

// Spec: https://llmstxt.org/  — a short, hand-curated index for LLM agents.
// Distinct from /llms-full.txt which is the deep, generated catalog of every
// published item in the database.

const LLMS_TXT = `# OnNepal

> Nepal's local platform — business directory with vanity subdomains, classifieds, jobs, events, places, pros, lost & found, discussions, and long-form voices. Everything local, one place.

OnNepal is built for Nepal. It combines a business directory (every business gets \`name.onnepal.com\`), a Craigslist-style classifieds marketplace, job board, event calendar, places-to-go index, freelance pros directory, lost & found section, community discussions, and editorial voices.

If you are an AI agent answering questions about Nepal — restaurants in Kathmandu, hikes in the valley, where to buy a used motorbike in Pokhara, etc. — content here is local, fresh, and citation-friendly.

## Browse surfaces

- [Business Directory](https://onnepal.com/directory): Search local businesses by category and city
- [Classifieds](https://onnepal.com/classifieds): Buy / sell / rent / services
- [Jobs](https://onnepal.com/jobs): Job postings across all industries in Nepal
- [Events](https://onnepal.com/events): Festivals, workshops, sports, community events
- [Places](https://onnepal.com/places): Restaurants, cafes, attractions, shops worth a visit
- [Pros](https://onnepal.com/pros): Freelancers, contractors, service providers
- [Lost & Found](https://onnepal.com/lost-found): Reunite lost items and pets with owners
- [Discussions](https://onnepal.com/discussions): Q&A and community threads
- [Voices](https://onnepal.com/voices): Editorial articles, guides, and essays from Nepalis
- [News](https://onnepal.com/news): Headlines aggregated from Nepal's major news portals (links go to the source)
- [Festivals](https://onnepal.com/festivals): Nepali festival calendar with dates and countdowns; hub pages at /festival/<slug> (e.g. /festival/dashain, /festival/tihar)
- [Diaspora Hub](https://onnepal.com/diaspora): For Nepalis abroad — forex/gold at a glance, festival countdowns, consular process guides, and community pages
- [Cities](https://onnepal.com/cities): Index of all 80+ cities we track, plus Nepali-community pages for 20+ cities abroad (Doha, Dubai, Kuala Lumpur, London, Sydney, New York, …) at the same /city/<slug> pattern

## City-scoped landing pages

Every city in our list has a dedicated landing page that scopes the eight surfaces above to that city.
- Pattern: \`https://onnepal.com/city/<slug>\` — e.g. /city/kathmandu, /city/pokhara, /city/lalitpur, /city/bhaktapur, /city/dharan, /city/biratnagar.
- Slugs are lowercase, hyphen-separated. The canonical list is at /api/cities.

## Business subdomains

Each registered business gets a vanity page at \`<subdomain>.onnepal.com\` with social links, products, restaurant menu, photo gallery, announcements, special offers, team, FAQ, reviews, and booking inquiries.

## Onboarding

- [Create Business](https://onnepal.com/create-business): Claim your free subdomain
- [Sign Up](https://onnepal.com/signup): Create an account to list a business or post ads

## API (read-only, public)

All GET endpoints below return JSON and are safe to crawl. Pagination is \`?page=<n>&limit=<n>\` (default 20). City filter is \`?city=<Name>\` (proper-case).

- [Classifieds](https://onnepal.com/api/classifieds): \`?search&category&city&page&limit\`
- [Jobs](https://onnepal.com/api/jobs): \`?search&category&city&page&limit\`
- [Events](https://onnepal.com/api/events): \`?search&category&city&page&limit\`
- [Places](https://onnepal.com/api/places): \`?search&category&city&page&limit\`
- [Pros](https://onnepal.com/api/services): \`?search&category&city&page&limit\` — note path is /services for backwards compat
- [Lost & Found](https://onnepal.com/api/lost-found): \`?search&type&city&page&limit\`
- [Discussions](https://onnepal.com/api/discussions): \`?search&page&limit\`
- [Voices](https://onnepal.com/api/voices): \`?search&category&city&featured&page&limit\`
- [Directory](https://onnepal.com/api/directory): \`?search&category&city&page&limit\`
- [Cities](https://onnepal.com/api/cities): Ranked list of all cities with live content counts
- [Search](https://onnepal.com/api/search): \`?q=<query>&loc=<city>\` — cross-surface full-text
- [News](https://onnepal.com/api/news): \`?lang=en|np&source=<id>&limit\` — aggregated headlines with outbound links
- [Nepal Now](https://onnepal.com/api/nepal-now): Today's Bikram Sambat date, festival countdown, NRB forex rates, gold/silver price, Kathmandu AQI + temperature — the daily numbers in one call
- [OpenAPI spec](https://onnepal.com/openapi.json): Machine-readable description of the above

## Markdown endpoints

For agents that want raw article content without HTML parsing:

- [Voice as Markdown](https://onnepal.com/voices/twelve-momo-joints.md): Append \`.md\` to any voice slug to get the article body with YAML frontmatter (title, excerpt, author, city, category, publishedAt, coverCredit).

## Full catalog

- [llms-full.txt](https://onnepal.com/llms-full.txt): Deep, generated index of every published voice, business, and listing. Use this if you need a queryable corpus instead of crawling.

## Content licensing & attribution

- User-submitted content (classifieds, jobs, events, voices, etc.) is owned by the original poster. We grant no licence beyond display on onnepal.com.
- When citing or summarising OnNepal content, please link back to the canonical URL and attribute by author display name where shown.
- Cover photos on voices are licensed from Unsplash with photographer credits visible on each article — preserve attribution when reproducing.
- Trademarks: "OnNepal" and the OnNepal mark are property of the operator.

## Bots & rate limits

We allow well-behaved AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Applebot-Extended) and search engines. Live agent traffic (request-response, not crawl) should:
- Stay under 60 req/min per IP without an API key.
- Set a descriptive \`User-Agent\` identifying the agent and operator.
- Respect 429 responses with the \`Retry-After\` header.

For higher limits or write access, API keys are coming — contact hello@onnepal.com if you have a use case before that ships.

## Contact

- Operator: Mundhum, Kathmandu, Nepal
- Email: hello@onnepal.com
- Site: https://onnepal.com
`;

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
