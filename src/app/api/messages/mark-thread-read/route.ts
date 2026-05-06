import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { markAsRead } from '@/lib/db/queries/messages';

const schema = z.object({
  otherUserId: z.string().min(1),
  listingType: z.string().min(1),
  listingId: z.string().min(1),
});

/**
 * Mark every unread message in a single thread as read. Called optimistically
 * by the MessagesBell popover when the user clicks a thread, so the badge
 * decrements without waiting for the dashboard to load and trigger its own
 * markAsRead via the GET-with-side-effect on /api/messages.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    const db = getDb(getD1Database());
    await markAsRead(db, session.userId, parsed.data.otherUserId, parsed.data.listingType, parsed.data.listingId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/messages/mark-thread-read] failed', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
