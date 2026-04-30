import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { bookmarks } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const d1 = getD1Database();
    const db = getDb(d1);
    const items = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, session.userId))
      .orderBy(desc(bookmarks.createdAt));

    return NextResponse.json({ bookmarks: items });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { targetType, targetId } = body as { targetType?: string; targetId?: string };
    if (!targetType || !targetId) {
      return NextResponse.json({ error: 'Missing targetType or targetId' }, { status: 400 });
    }

    const d1 = getD1Database();
    const db = getDb(d1);

    // Check if already bookmarked
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

    if (existing.length > 0) {
      // Remove bookmark
      await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
      return NextResponse.json({ bookmarked: false });
    }

    // Create bookmark
    await db.insert(bookmarks).values({
      id: generateId(),
      userId: session.userId,
      targetType,
      targetId,
      createdAt: new Date(),
    });

    return NextResponse.json({ bookmarked: true }, { status: 201 });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
