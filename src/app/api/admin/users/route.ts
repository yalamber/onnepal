import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/helpers/admin-auth';
import { users } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1'));
    const limit = 20;
    const offset = (page - 1) * limit;

    const results = await auth.db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        phone: users.phone,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await auth.db.select({ count: sql<number>`count(*)` }).from(users);
    const total = countResult[0]?.count || 0;

    return NextResponse.json({ users: results, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
