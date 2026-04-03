import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { updateCtaButton, deleteCtaButton } from '@/lib/db/queries/ctas';
import { getSession } from '@/lib/auth/session';
import { ctaButtonSchema } from '@/lib/validators/business';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = ctaButtonSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const d1 = await getD1Database();
    const db = getDb(d1);
    await updateCtaButton(db, id, validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update CTA error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);
    await deleteCtaButton(db, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete CTA error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
