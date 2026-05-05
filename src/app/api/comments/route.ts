import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getComments, createComment } from '@/lib/db/queries/comments';
import { getSession } from '@/lib/auth/session';
import { createCommentSchema } from '@/lib/validators/listings';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';
import { createNotification } from '@/lib/db/queries/notifications';
import { classifieds, jobs, events, places, services, lostFound, discussions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Look up the userId of the author of the comment's target so we can notify
// them. Returns null when the target isn't a known type or doesn't exist.
async function lookupTargetOwner(
  db: Awaited<ReturnType<typeof getDb>>,
  targetType: string,
  targetId: string,
): Promise<{ userId: string; title: string; href: string } | null> {
  const sources = [
    { type: 'classified',  table: classifieds, idCol: classifieds.id, userCol: classifieds.userId, titleCol: classifieds.title, hrefBase: '/classifieds' },
    { type: 'job',         table: jobs,        idCol: jobs.id,        userCol: jobs.userId,        titleCol: jobs.title,        hrefBase: '/jobs' },
    { type: 'event',       table: events,      idCol: events.id,      userCol: events.userId,      titleCol: events.title,      hrefBase: '/events' },
    { type: 'place',       table: places,      idCol: places.id,      userCol: places.userId,      titleCol: places.title,      hrefBase: '/places' },
    { type: 'service',     table: services,    idCol: services.id,    userCol: services.userId,    titleCol: services.title,    hrefBase: '/pros' },
    { type: 'lost-found',  table: lostFound,   idCol: lostFound.id,   userCol: lostFound.userId,   titleCol: lostFound.title,   hrefBase: '/lost-found/post' },
    { type: 'discussion',  table: discussions, idCol: discussions.id, userCol: discussions.userId, titleCol: discussions.title, hrefBase: '/discussions' },
  ] as const;
  const src = sources.find((s) => s.type === targetType);
  if (!src) return null;
  const rows = await db
    .select({ userId: src.userCol, title: src.titleCol })
    .from(src.table)
    // @ts-expect-error drizzle eq typing across the union doesn't narrow cleanly here
    .where(eq(src.idCol, targetId))
    .limit(1);
  const r = rows[0];
  if (!r) return null;
  return { userId: r.userId as string, title: r.title as string, href: `${src.hrefBase}/${targetId}` };
}

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
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const db = getDb(d1);
    const result = await createComment(db, session.userId, validation.data);

    // Notify the target's author (unless they're commenting on their own item).
    const owner = await lookupTargetOwner(db, validation.data.targetType, validation.data.targetId);
    if (owner && owner.userId !== session.userId) {
      await createNotification(db, {
        userId: owner.userId,
        type: 'comment_received',
        title: `New comment on "${owner.title}"`,
        body: validation.data.content.slice(0, 160) + (validation.data.content.length > 160 ? '…' : ''),
        linkHref: owner.href,
      });
    }

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
