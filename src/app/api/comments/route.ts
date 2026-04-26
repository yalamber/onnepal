import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getComments, createComment } from '@/lib/db/queries/comments';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';

const VALID_TYPES = ['classified', 'job', 'event', 'lost-found'];

const createSchema = z.object({
  targetType: z.string().refine(t => VALID_TYPES.includes(t)),
  targetId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const targetType = sp.get('targetType');
    const targetId = sp.get('targetId');
    if (!targetType || !targetId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const d1 = getD1Database();
    const db = getDb(d1);
    const items = await getComments(db, targetType, targetId);

    return NextResponse.json({ comments: items });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const d1 = getD1Database();
    const rl = await checkRateLimit(d1, 'comment:create', session.userId, 30, 3600);
    if (!rl.allowed) return tooManyRequests(3600);

    const body = await request.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const db = getDb(d1);
    const result = await createComment(db, session.userId, validation.data);

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
