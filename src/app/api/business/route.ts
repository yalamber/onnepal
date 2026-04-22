import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getBusinessesByUserId, createBusiness, isSubdomainTaken } from '@/lib/db/queries/businesses';
import { getSession } from '@/lib/auth/session';
import { createBusinessSchema } from '@/lib/validators/business';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d1 = getD1Database();
    const db = getDb(d1);
    const businesses = await getBusinessesByUserId(db, session.userId);

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Get businesses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createBusinessSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { subdomain, businessName, businessCategory } = validation.data;

    const d1 = getD1Database();
    const db = getDb(d1);

    const taken = await isSubdomainTaken(db, subdomain);
    if (taken) {
      return NextResponse.json({ error: 'This name is already taken' }, { status: 400 });
    }

    const business = await createBusiness(db, session.userId, {
      subdomain,
      businessName,
      businessCategory,
    });

    return NextResponse.json(
      { success: true, business: { id: business.id, subdomain: business.subdomain } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Maximum of')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Create business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
