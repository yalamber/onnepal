import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { createReply, getDiscussionById } from '@/lib/db/queries/discussions';
import { getSession } from '@/lib/auth/session';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';
import { z } from 'zod';

const replySchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const d1 = getD1Database();
    const rl = await checkRateLimit(d1, 'comment:create', session.userId, 30, 3600);
    if (!rl.allowed) return tooManyRequests(3600);

    const body = await request.json();
    const validation = replySchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    const db = getDb(d1);

    // Verify discussion exists
    const discussion = await getDiscussionById(db, id);
    if (!discussion) return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });

    const result = await createReply(db, session.userId, {
      discussionId: id,
      content: validation.data.content,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create reply error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
