import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/helpers/admin-auth';
import { voices, users } from '@/lib/db/schema';
import { desc, sql, eq } from 'drizzle-orm';

const VALID_STATUSES = ['draft', 'pending', 'published', 'rejected'] as const;
type Status = typeof VALID_STATUSES[number];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const sp = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = 20;
    const offset = (page - 1) * limit;
    const statusParam = sp.get('status');
    const status = statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as Status)
      : null;

    const where = status ? eq(voices.status, status) : undefined;

    const rowsQ = auth.db
      .select({
        id: voices.id,
        slug: voices.slug,
        title: voices.title,
        excerpt: voices.excerpt,
        category: voices.category,
        city: voices.city,
        status: voices.status,
        isFeatured: voices.isFeatured,
        publishedAt: voices.publishedAt,
        createdAt: voices.createdAt,
        userId: voices.userId,
        ownerEmail: users.email,
        ownerName: users.displayName,
      })
      .from(voices)
      .leftJoin(users, eq(voices.userId, users.id));

    const rows = await (where ? rowsQ.where(where) : rowsQ)
      .orderBy(desc(voices.createdAt))
      .limit(limit)
      .offset(offset);

    const countQ = auth.db.select({ c: sql<number>`count(*)` }).from(voices);
    const countRows = await (where ? countQ.where(where) : countQ);
    const total = Number(countRows[0]?.c ?? 0);

    // Counts per status, used for the filter chips on the page.
    const statusCounts = await auth.db
      .select({ status: voices.status, c: sql<number>`count(*)` })
      .from(voices)
      .groupBy(voices.status);

    return NextResponse.json({
      voices: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, Number(s.c)])),
    });
  } catch (error) {
    console.error('[admin/voices] GET failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
