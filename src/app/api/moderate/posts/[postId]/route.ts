import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { createModerationAction } from '@/lib/db/queries/moderation';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const moderateSchema = z.object({
  action: z.enum(['approve', 'reject', 'flag']),
  reason: z.string().optional(),
});

// POST /api/moderate/posts/[postId] - Moderate a post
export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is moderator or admin
    if (session.role !== 'moderator' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Moderator access required' }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validation = moderateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { action, reason } = validation.data;

    const d1 = await getD1Database();
    const db = getDb(d1);

    // Create moderation action
    await createModerationAction(db, {
      postId,
      moderatorId: session.userId,
      action,
      reason,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Moderate post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
