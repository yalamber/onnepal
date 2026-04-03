import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getCtaButtons, createCtaButton } from '@/lib/db/queries/ctas';
import { getSession } from '@/lib/auth/session';
import { ctaButtonSchema } from '@/lib/validators/business';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);
    const items = await getCtaButtons(db, session.userId);

    return NextResponse.json({ ctas: items });
  } catch (error) {
    console.error('Get CTAs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = ctaButtonSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const d1 = await getD1Database();
    const db = getDb(d1);
    const result = await createCtaButton(db, session.userId, validation.data);

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create CTA error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
