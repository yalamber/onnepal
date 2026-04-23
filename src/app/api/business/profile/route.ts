import { NextResponse } from 'next/server';
import { updateBusinessProfile } from '@/lib/db/queries/businesses';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';
import { updateProfileSchema } from '@/lib/validators/business';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    return NextResponse.json({ profile: auth.business });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    if (data.logoUrl && !data.logoUrl.startsWith(auth.session.userId + '/') && data.logoUrl !== '') {
      return NextResponse.json({ error: 'Invalid logo image' }, { status: 400 });
    }
    if (data.coverImageUrl && !data.coverImageUrl.startsWith(auth.session.userId + '/') && data.coverImageUrl !== '') {
      return NextResponse.json({ error: 'Invalid cover image' }, { status: 400 });
    }

    await updateBusinessProfile(auth.db, auth.businessId, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
