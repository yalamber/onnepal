import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getClassifiedById, deleteClassified, updateClassified } from '@/lib/db/queries/classifieds';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).nullish(),
  price: z.string().max(50).nullish(),
  category: z.string().min(1).optional(),
  location: z.string().max(200).nullish(),
  contactPhone: z.string().max(20).nullish(),
  contactWhatsapp: z.string().max(20).nullish(),
  imageUrls: z.array(z.string().max(500)).max(5).nullish(),
  status: z.enum(['active', 'sold', 'expired']).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);

    const listing = await getClassifiedById(db, id);
    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Get classified error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validation = updateSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    if (validation.data.imageUrls) {
      const invalid = validation.data.imageUrls.some((url) => !url.startsWith(session.userId + '/'));
      if (invalid) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);
    await updateClassified(db, id, session.userId, validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update classified error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);

    await deleteClassified(db, id, session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete classified error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
