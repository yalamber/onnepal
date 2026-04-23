import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/helpers/admin-auth';
import { businesses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json() as { isPublished?: boolean };

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.isPublished !== undefined) updates.isPublished = body.isPublished;

    await auth.db.update(businesses).set(updates).where(eq(businesses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update business error:', error);
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
    await auth.db.delete(businesses).where(eq(businesses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
