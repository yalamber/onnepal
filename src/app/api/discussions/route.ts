import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getDiscussions, getDiscussionsCount, createDiscussion } from '@/lib/db/queries/discussions';
import { getSession } from '@/lib/auth/session';
import { createDiscussionSchema } from '@/lib/validators/listings';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get('category') || undefined;
    const search = sp.get('search') || undefined;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(sp.get('limit') || '20', 10)));

    const d1 = getD1Database();
    const db = getDb(d1);

    const [items, total] = await Promise.all([
      getDiscussions(db, { category, search, page, limit }),
      getDiscussionsCount(db, { category, search }),
    ]);

    const res = NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) });
    res.headers.set('Cache-Control', 'public, s-maxage=60');
    return res;
  } catch (error) {
    console.error('Discussions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const d1 = getD1Database();
    const rl = await checkRateLimit(d1, 'discussion:create', session.userId, 10, 86400);
    if (!rl.allowed) return tooManyRequests(86400);

    const body = await request.json();
    const validation = createDiscussionSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });

    const db = getDb(d1);
    const result = await createDiscussion(db, session.userId, {
      title: validation.data.title,
      content: validation.data.content ?? undefined,
      category: validation.data.category,
      city: validation.data.city ?? undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create discussion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
