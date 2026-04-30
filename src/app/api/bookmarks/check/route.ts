import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { bookmarks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ bookmarked: false });

    const sp = request.nextUrl.searchParams;
    const targetType = sp.get('targetType');
    const targetId = sp.get('targetId');
    if (!targetType || !targetId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const d1 = getD1Database();
    const db = getDb(d1);
    const existing = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, session.userId),
          eq(bookmarks.targetType, targetType),
          eq(bookmarks.targetId, targetId),
        )
      )
      .limit(1);

    return NextResponse.json({ bookmarked: existing.length > 0 });
  } catch (error) {
    console.error('Check bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
