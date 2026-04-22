import { NextResponse } from 'next/server';
import { updateCtaButton, deleteCtaButton } from '@/lib/db/queries/ctas';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';
import { ctaButtonSchema } from '@/lib/validators/business';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const validation = ctaButtonSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    await updateCtaButton(auth.db, id, auth.businessId, validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update CTA error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    await deleteCtaButton(auth.db, id, auth.businessId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete CTA error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
