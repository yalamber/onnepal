import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { getPublishedVoices, getPublishedVoicesCount, createVoice } from '@/lib/db/queries/voices';
import { notifyAllAdmins } from '@/lib/db/queries/notifications';

const createSchema = z.object({
  title: z.string().min(4).max(200),
  excerpt: z.string().max(280).nullish(),
  content: z.string().min(40).max(40000),
  coverImageUrl: z.string().max(500).nullish(),
  city: z.string().max(80).nullish(),
  category: z.string().max(40).nullish(),
});

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const city = sp.get('city') || undefined;
    const category = sp.get('category') || undefined;
    const search = sp.get('search') || undefined;
    const featuredOnly = sp.get('featured') === '1';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(sp.get('limit') || '20', 10)));

    const db = getDb(getD1Database());
    const [items, total] = await Promise.all([
      getPublishedVoices(db, { city, category, search, featuredOnly, page, limit }),
      getPublishedVoicesCount(db, { city, category, search }),
    ]);

    const res = NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res;
  } catch (error) {
    console.error('[api/voices] GET failed', error);
    return NextResponse.json({ items: [], total: 0, page: 1, totalPages: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }
    const data = parsed.data;

    const db = getDb(getD1Database());
    const { id, slug } = await createVoice(db, {
      userId: session.userId,
      title: data.title,
      excerpt: data.excerpt ?? undefined,
      content: data.content,
      coverImageUrl: data.coverImageUrl ?? undefined,
      city: data.city ?? undefined,
      category: data.category ?? undefined,
    });

    // Fan-out admin alert: every is_admin user gets a notification to moderate.
    await notifyAllAdmins(db, {
      type: 'voice_pending',
      title: 'New voice pending review',
      body: data.title,
      linkHref: '/admin/voices?status=pending',
    });

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch (error) {
    console.error('[api/voices] POST failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
