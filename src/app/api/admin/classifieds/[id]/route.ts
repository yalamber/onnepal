import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/helpers/admin-auth';
import { classifieds } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json() as { status?: string };

    const validStatuses = ['active', 'sold', 'expired', 'removed'] as const;
    if (body.status && !validStatuses.includes(body.status as typeof validStatuses[number])) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status) updates.status = body.status;

    await auth.db.update(classifieds).set(updates).where(eq(classifieds.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update classified error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { id } = await params;
    await auth.db.delete(classifieds).where(eq(classifieds.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete classified error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
