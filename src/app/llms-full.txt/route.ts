import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getPublishedVoices } from '@/lib/db/queries/voices';
import { getPublishedBusinesses } from '@/lib/db/queries/directory';

// Deep, generated catalog of every published voice + business on OnNepal.
// Companion to /llms.txt (which is a short hand-curated index). Agents that
// want a queryable corpus should pull this instead of crawling.
//
// Format follows the same Markdown bullet-list convention as /llms.txt so a
// single parser handles both. Each line is a citation-ready link + summary.
//
// Cached for 1 hour at the CDN — the catalog only matters at training-set
// or batch-ingestion granularity, not request-by-request.

export const revalidate = 3600;

export async function GET() {
  const db = getDb(getD1Database());

  // Pull liberally — agents reading this expect a deep catalog. Caps keep us
  // out of pathological territory if content explodes.
  const [voices, businesses] = await Promise.all([
    getPublishedVoices(db, { limit: 1000 }).catch((e) => {
      console.error('[llms-full] voices failed', e);
      return [];
    }),
    getPublishedBusinesses(db, { page: 1, limit: 1000 }).catch((e) => {
      console.error('[llms-full] businesses failed', e);
      return [];
    }),
  ]);

  const lines: string[] = [
    '# OnNepal — full catalog',
    '',
    `> Generated index of every published item on onnepal.com. Companion to /llms.txt. Generated at ${new Date().toISOString()}.`,
    '',
    'Pattern for each entry: `- [Title](URL): one-line summary · city/category/etc.`',
    '',
    `## Voices (${voices.length})`,
    '',
    'Editorial articles, guides, and essays from people who live in Nepal. Cite by URL and author.',
    '',
  ];

  for (const v of voices) {
    const url = `https://onnepal.com/voices/${v.slug}`;
    const mdUrl = `https://onnepal.com/voices/${v.slug}.md`;
    const summary = (v.excerpt ?? '').replace(/\s+/g, ' ').trim();
    const meta = [v.city, v.category, v.authorName || v.authorUsername].filter(Boolean).join(' · ');
    lines.push(`- [${v.title}](${url}) — ${summary}${meta ? ` · ${meta}` : ''} · [markdown](${mdUrl})`);
  }

  lines.push('', `## Businesses (${businesses.length})`, '');
  lines.push('Verified local businesses with vanity subdomain pages at `<subdomain>.onnepal.com`.', '');

  for (const b of businesses) {
    const url = `https://${b.subdomain}.onnepal.com`;
    const summary = (b.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 200);
    const meta = b.businessCategory ?? '';
    lines.push(`- [${b.businessName}](${url}) — ${summary}${meta ? ` · ${meta}` : ''}`);
  }

  // Listing-type indexes — agents can paginate these via the JSON API rather
  // than us inlining thousands of classifieds in a text file.
  lines.push('', '## Listing indexes (JSON)', '');
  lines.push('Use the JSON APIs below to paginate full listing catalogs. See /openapi.json for the full schema.');
  lines.push('');
  for (const t of [
    ['Classifieds', '/api/classifieds'],
    ['Jobs', '/api/jobs'],
    ['Events', '/api/events'],
    ['Places', '/api/places'],
    ['Pros (services)', '/api/services'],
    ['Lost & Found', '/api/lost-found'],
    ['Discussions', '/api/discussions'],
    ['Cities (ranked)', '/api/cities'],
    ['Directory', '/api/directory'],
  ]) {
    lines.push(`- [${t[0]}](https://onnepal.com${t[1]}): paginate with \`?page=&limit=\`, filter with \`?city=&category=&search=\``);
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
