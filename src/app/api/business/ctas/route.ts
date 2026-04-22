import { NextResponse } from 'next/server';
import { getCtaButtons, createCtaButton } from '@/lib/db/queries/ctas';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';
import { ctaButtonSchema } from '@/lib/validators/business';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const items = await getCtaButtons(auth.db, auth.businessId);

    return NextResponse.json({ ctas: items });
  } catch (error) {
    console.error('Get CTAs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const validation = ctaButtonSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createCtaButton(auth.db, auth.businessId, validation.data);

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create CTA error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
