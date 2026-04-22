import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { getBusinessById } from '@/lib/db/queries/businesses';

export async function getAuthenticatedBusiness(request: Request) {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const url = new URL(request.url);
  const businessId = url.searchParams.get('businessId');
  if (!businessId) {
    return { error: NextResponse.json({ error: 'Business ID required' }, { status: 400 }) };
  }

  const d1 = getD1Database();
  const db = getDb(d1);

  const business = await getBusinessById(db, businessId);
  if (!business || business.userId !== session.userId) {
    return { error: NextResponse.json({ error: 'Business not found' }, { status: 404 }) };
  }

  return { session, db, business, businessId };
}
