import { NextResponse } from 'next/server';
import { getSocialLinks, createSocialLink } from '@/lib/db/queries/links';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';
import { socialLinkSchema } from '@/lib/validators/business';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const links = await getSocialLinks(auth.db, auth.businessId);

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Get links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const validation = socialLinkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createSocialLink(auth.db, auth.businessId, validation.data);

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
