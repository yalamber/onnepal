import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/helpers/admin-auth';
import { voices } from '@/lib/db/schema';
import { createNotification } from '@/lib/db/queries/notifications';

const VALID_STATUSES = ['draft', 'pending', 'published', 'rejected'] as const;
type Status = typeof VALID_STATUSES[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json().catch(() => ({})) as {
      status?: string;
      isFeatured?: boolean;
    };

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.status !== undefined) {
      if (!(VALID_STATUSES as readonly string[]).includes(body.status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
      }
      updates.status = body.status as Status;
      // First-time publish: stamp publishedAt. Re-publishes don't overwrite.
      if (body.status === 'published') {
        const existing = await auth.db
          .select({ publishedAt: voices.publishedAt })
          .from(voices)
          .where(eq(voices.id, id))
          .limit(1);
        if (!existing[0]?.publishedAt) {
          updates.publishedAt = new Date();
        }
      }
    }

    if (body.isFeatured !== undefined) {
      updates.isFeatured = !!body.isFeatured;
    }

    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ error: 'No-op: send `status` or `isFeatured`' }, { status: 400 });
    }

    await auth.db.update(voices).set(updates).where(eq(voices.id, id));

    // Notify the voice's author when status flips to published or rejected.
    if (body.status === 'published' || body.status === 'rejected') {
      const row = await auth.db
        .select({ userId: voices.userId, title: voices.title, slug: voices.slug })
        .from(voices)
        .where(eq(voices.id, id))
        .limit(1);
      const v = row[0];
      if (v) {
        if (body.status === 'published') {
          await createNotification(auth.db, {
            userId: v.userId,
            type: 'voice_approved',
            title: 'Your voice is published',
            body: `"${v.title}" is now live on OnNepal.`,
            linkHref: `/voices/${v.slug}`,
          });
        } else {
          await createNotification(auth.db, {
            userId: v.userId,
            type: 'voice_rejected',
            title: 'Your voice was rejected',
            body: `"${v.title}" wasn’t approved. Reach out if you want feedback.`,
            linkHref: '/voices/post/new',
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/voices/:id] PATCH failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { id } = await params;
    await auth.db.delete(voices).where(eq(voices.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/voices/:id] DELETE failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
