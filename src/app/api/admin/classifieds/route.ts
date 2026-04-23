import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/helpers/admin-auth';
import { classifieds, users } from '@/lib/db/schema';
import { desc, sql, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1'));
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = request.nextUrl.searchParams.get('status');

    let query = auth.db
      .select({
        id: classifieds.id,
        title: classifieds.title,
        category: classifieds.category,
        price: classifieds.price,
        location: classifieds.location,
        status: classifieds.status,
        createdAt: classifieds.createdAt,
        userId: classifieds.userId,
        ownerEmail: users.email,
        ownerName: users.displayName,
      })
      .from(classifieds)
      .leftJoin(users, eq(classifieds.userId, users.id))
      .orderBy(desc(classifieds.createdAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where(eq(classifieds.status, status)) as typeof query;
    }

    const results = await query;
    const countResult = await auth.db.select({ count: sql<number>`count(*)` }).from(classifieds);
    const total = countResult[0]?.count || 0;

    return NextResponse.json({ classifieds: results, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin classifieds error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
