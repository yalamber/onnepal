import { NextResponse } from 'next/server';
import { reorderSocialLinks } from '@/lib/db/queries/links';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';
import { reorderSchema } from '@/lib/validators/business';

export async function PUT(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const validation = reorderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await reorderSocialLinks(auth.db, auth.businessId, validation.data.ids);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
