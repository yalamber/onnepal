import { NextResponse } from 'next/server';

// OpenAPI 3.1 spec covering OnNepal's public read API. Hand-rolled — the
// surface is small enough that maintaining this directly is less work than
// wiring up zod-to-openapi and chasing edge cases. Whenever you add a new
// public GET route, update the corresponding `paths` entry here.
//
// Consumers: ChatGPT Actions, Claude tool-use, Postman/Insomnia imports,
// generated SDKs, sitemap-style agents.

const SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'OnNepal Public API',
    description:
      "Read-only public API for OnNepal's content surfaces: business directory, classifieds, jobs, events, places, pros, lost & found, discussions, voices, and cities. All endpoints return JSON unless noted. Write endpoints exist but require an authenticated user session (cookie-based today; API keys planned).",
    version: '1.0.0',
    contact: { name: 'OnNepal', email: 'hello@onnepal.com', url: 'https://onnepal.com' },
    license: { name: 'See /llms.txt for content licensing' },
  },
  servers: [{ url: 'https://onnepal.com', description: 'Production' }],
  components: {
    parameters: {
      Page: { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
      Limit: { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
      Search: { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Full-text match against title/description' },
      Category: { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category (varies per surface)' },
      City: { name: 'city', in: 'query', schema: { type: 'string' }, description: 'City name in proper case (e.g. "Kathmandu")' },
    },
    schemas: {
      PaginatedResponse: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'object' } },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
        },
      },
      Voice: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          slug: { type: 'string' },
          title: { type: 'string' },
          excerpt: { type: 'string', nullable: true },
          content: { type: 'string', description: 'Markdown body' },
          coverImageUrl: { type: 'string', nullable: true },
          coverCreditName: { type: 'string', nullable: true },
          coverCreditUrl: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          category: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['draft', 'pending', 'published', 'rejected'] },
          isFeatured: { type: 'boolean' },
          publishedAt: { type: 'integer', nullable: true, description: 'Unix ms' },
          authorName: { type: 'string', nullable: true },
          authorUsername: { type: 'string', nullable: true },
        },
      },
      Business: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          subdomain: { type: 'string' },
          businessName: { type: 'string' },
          businessCategory: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          logoUrl: { type: 'string', nullable: true },
        },
      },
      Error: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
  paths: {
    '/api/directory': {
      get: {
        summary: 'List published businesses',
        parameters: [{ $ref: '#/components/parameters/Search' }, { $ref: '#/components/parameters/Category' }, { $ref: '#/components/parameters/City' }, { $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
        responses: { '200': { description: 'Paginated businesses', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } } },
      },
    },
    '/api/classifieds': {
      get: {
        summary: 'List active classified ads',
        parameters: [{ $ref: '#/components/parameters/Search' }, { $ref: '#/components/parameters/Category' }, { $ref: '#/components/parameters/City' }, { $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
        responses: { '200': { description: 'Paginated classifieds' } },
      },
    },
    '/api/jobs': {
      get: {
        summary: 'List active job postings',
        parameters: [{ $ref: '#/components/parameters/Search' }, { $ref: '#/components/parameters/Category' }, { $ref: '#/components/parameters/City' }, { $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
        responses: { '200': { description: 'Paginated jobs' } },
      },
    },
    '/api/events': {
      get: {
        summary: 'List upcoming events',
        parameters: [{ $ref: '#/components/parameters/Search' }, { $ref: '#/components/parameters/Category' }, { $ref: '#/components/parameters/City' }, { $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
        responses: { '200': { description: 'Paginated events' } },
      },
    },
    '/api/places': {
      get: {
        summary: 'List published places',
        parameters: [{ $ref: '#/components/parameters/Search' }, { $ref: '#/components/parameters/Category' }, { $ref: '#/components/parameters/City' }, { $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
        responses: { '200': { description: 'Paginated places' } },
      },
    },
    '/api/services': {
      get: {
        summary: 'List pros / freelancers (path is /services for backwards compatibility; product name is "Pros")',
        parameters: [{ $ref: '#/components/parameters/Search' }, { $ref: '#/components/parameters/Category' }, { $ref: '#/components/parameters/City' }, { $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
        responses: { '200': { description: 'Paginated pros' } },
      },
    },
    '/api/lost-found': {
      get: {
        summary: 'List active lost & found posts',
        parameters: [{ name: 'type', in: 'query', schema: { type: 'string', enum: ['lost', 'found'] } }, { $ref: '#/components/parameters/Search' }, { $ref: '#/components/parameters/City' }, { $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
        responses: { '200': { description: 'Paginated lost & found' } },
      },
    },
    '/api/discussions': {
      get: {
        summary: 'List community discussion threads',
        parameters: [{ $ref: '#/components/parameters/Search' }, { $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
        responses: { '200': { description: 'Paginated discussions' } },
      },
    },
    '/api/voices': {
      get: {
        summary: 'List published voices (editorial articles)',
        parameters: [
          { $ref: '#/components/parameters/Search' },
          { $ref: '#/components/parameters/Category' },
          { $ref: '#/components/parameters/City' },
          { name: 'featured', in: 'query', schema: { type: 'boolean' }, description: 'Return only voices marked featured' },
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: { '200': { description: 'Paginated voices' } },
      },
    },
    '/api/voices/{slug}': {
      get: {
        summary: 'Get a single voice. Use ?format=md (or `Accept: text/markdown`) for raw markdown.',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'md'] }, description: 'json (default) or md' },
        ],
        responses: {
          '200': {
            description: 'Voice record',
            content: {
              'application/json': { schema: { type: 'object', properties: { voice: { $ref: '#/components/schemas/Voice' } } } },
              'text/markdown': { schema: { type: 'string', description: 'Article body with YAML frontmatter' } },
            },
          },
          '404': { description: 'Voice not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/cities': {
      get: {
        summary: 'All cities ranked by total live content',
        responses: { '200': { description: 'City list' } },
      },
    },
    '/api/search': {
      get: {
        summary: 'Cross-surface full-text search',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, required: true },
          { name: 'loc', in: 'query', schema: { type: 'string' }, description: 'Optional city filter' },
        ],
        responses: { '200': { description: 'Mixed result set across listings + voices + businesses' } },
      },
    },
    '/api/site/{subdomain}': {
      get: {
        summary: 'Public business page payload (used by *.onnepal.com SSR)',
        parameters: [{ name: 'subdomain', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Business + related modules', content: { 'application/json': { schema: { type: 'object' } } } } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(SPEC, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      // Permissive CORS so agent dev tools can fetch this from anywhere.
      'Access-Control-Allow-Origin': '*',
    },
  });
}
