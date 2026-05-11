import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getVoiceBySlug } from '@/lib/db/queries/voices';

// JSON form of a single voice. For markdown (`/voices/<slug>.md`), see
// /api/voices/[slug]/md/route.ts — the public .md URL is rewritten there
// by middleware.

interface Params { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  let voice;
  try {
    const db = getDb(getD1Database());
    voice = await getVoiceBySlug(db, slug);
  } catch (err) {
    console.error('[/api/voices/[slug]] db error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (!voice || voice.status !== 'published') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ voice }, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' },
  });
}
