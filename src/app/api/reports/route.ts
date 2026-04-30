import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { reports } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { targetType, targetId, reason } = body as {
      targetType?: string;
      targetId?: string;
      reason?: string;
    };

    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (reason.length < 1 || reason.length > 500) {
      return NextResponse.json({ error: 'Reason must be 1-500 characters' }, { status: 400 });
    }

    const d1 = getD1Database();
    const db = getDb(d1);

    // Check for duplicate report from same user on same target
    const existing = await db
      .select({ id: reports.id })
      .from(reports)
      .where(
        and(
          eq(reports.userId, session.userId),
          eq(reports.targetType, targetType),
          eq(reports.targetId, targetId),
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'You have already reported this item' }, { status: 409 });
    }

    await db.insert(reports).values({
      id: generateId(),
      userId: session.userId,
      targetType,
      targetId,
      reason,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
