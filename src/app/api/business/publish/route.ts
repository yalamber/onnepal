import { NextResponse } from 'next/server';
import { publishBusiness } from '@/lib/db/queries/businesses';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    await publishBusiness(auth.db, auth.businessId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
