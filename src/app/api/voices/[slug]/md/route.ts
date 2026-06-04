import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getVoiceBySlug } from '@/lib/db/queries/voices';

// Markdown form of a single voice. Mounted publicly at /voices/<slug>.md
// via the middleware rewrite — agents reading articles for citation
// should hit that URL.
//
// JSON form lives at /api/voices/<slug>; this endpoint deliberately only
// serves markdown so the path/content-type pairing is unambiguous.

interface Params { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  let voice;
  try {
    const db = getDb(getD1Database());
    voice = await getVoiceBySlug(db, slug);
  } catch (err) {
    console.error('[/api/voices/[slug]/md] db error', err);
    return new NextResponse('Internal server error\n', { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }

  if (!voice || voice.status !== 'published') {
    return new NextResponse('Not found\n', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }

  return new NextResponse(toMarkdown(voice), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Link': `<https://onnepal.com/voices/${voice.slug}>; rel="canonical"`,
    },
  });
}

function toMarkdown(v: NonNullable<Awaited<ReturnType<typeof getVoiceBySlug>>>): string {
  const escape = (s: string) => s.replace(/"/g, '\\"');
  const lines: string[] = ['---'];
  lines.push(`title: "${escape(v.title)}"`);
  if (v.excerpt) lines.push(`excerpt: "${escape(v.excerpt)}"`);
  lines.push(`slug: "${v.slug}"`);
  lines.push(`url: "https://onnepal.com/voices/${v.slug}"`);
  if (v.authorName) lines.push(`author: "${escape(v.authorName)}"`);
  if (v.authorUsername) lines.push(`authorUsername: "${v.authorUsername}"`);
  if (v.city) lines.push(`city: "${escape(v.city)}"`);
  if (v.category) lines.push(`category: "${escape(v.category)}"`);
  if (v.publishedAt) lines.push(`publishedAt: "${new Date(v.publishedAt).toISOString()}"`);
  lines.push(`updatedAt: "${new Date(v.updatedAt).toISOString()}"`);
  if (v.coverImageUrl) {
    const fullUrl = v.coverImageUrl.startsWith('http')
      ? v.coverImageUrl
      : `https://images.onnepal.com/${v.coverImageUrl}`;
    lines.push(`coverImage: "${fullUrl}"`);
  }
  if (v.coverCreditName) lines.push(`coverCreditName: "${escape(v.coverCreditName)}"`);
  if (v.coverCreditUrl) lines.push(`coverCreditUrl: "${v.coverCreditUrl}"`);
  lines.push('---');
  lines.push('');
  lines.push(v.content);
  return lines.join('\n');
}
