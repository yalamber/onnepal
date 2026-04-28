import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { sendMessage, getConversations, getThread, markAsRead } from '@/lib/db/queries/messages';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';

const sendSchema = z.object({
  recipientId: z.string().min(1),
  listingType: z.string().min(1),
  listingId: z.string().min(1),
  listingTitle: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp = request.nextUrl.searchParams;
    const otherUserId = sp.get('otherUserId');
    const listingType = sp.get('listingType');
    const listingId = sp.get('listingId');

    const d1 = getD1Database();
    const db = getDb(d1);

    if (otherUserId && listingType && listingId) {
      const thread = await getThread(db, session.userId, otherUserId, listingType, listingId);
      await markAsRead(db, session.userId, otherUserId, listingType, listingId);
      return NextResponse.json({ messages: thread });
    }

    const conversations = await getConversations(db, session.userId);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const d1 = getD1Database();
    const rl = await checkRateLimit(d1, 'message:send', session.userId, 50, 3600);
    if (!rl.allowed) return tooManyRequests(3600);

    const body = await request.json();
    const validation = sendSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    if (validation.data.recipientId === session.userId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    const db = getDb(d1);

    const result = await sendMessage(db, { senderId: session.userId, ...validation.data });
    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
