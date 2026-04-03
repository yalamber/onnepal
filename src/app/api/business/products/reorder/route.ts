import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { reorderProducts } from '@/lib/db/queries/products';
import { getSession } from '@/lib/auth/session';
import { reorderSchema } from '@/lib/validators/business';

export async function PUT(request: Request) {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = reorderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);
    await reorderProducts(db, session.userId, validation.data.ids);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
