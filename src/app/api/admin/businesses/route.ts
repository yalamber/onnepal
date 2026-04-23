import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/helpers/admin-auth';
import { businesses, users } from '@/lib/db/schema';
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
        id: businesses.id,
        subdomain: businesses.subdomain,
        businessName: businesses.businessName,
        businessCategory: businesses.businessCategory,
        isPublished: businesses.isPublished,
        createdAt: businesses.createdAt,
        userId: businesses.userId,
        ownerEmail: users.email,
        ownerName: users.displayName,
      })
      .from(businesses)
      .leftJoin(users, eq(businesses.userId, users.id))
      .orderBy(desc(businesses.createdAt))
      .limit(limit)
      .offset(offset);

    if (status === 'published') {
      query = query.where(eq(businesses.isPublished, true)) as typeof query;
    } else if (status === 'unpublished') {
      query = query.where(eq(businesses.isPublished, false)) as typeof query;
    }

    const results = await query;
    const countResult = await auth.db.select({ count: sql<number>`count(*)` }).from(businesses);
    const total = countResult[0]?.count || 0;

    return NextResponse.json({ businesses: results, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin businesses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
