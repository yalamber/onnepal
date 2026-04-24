import { NextResponse } from 'next/server';
import { deleteFaq } from '@/lib/db/queries/faq';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    await deleteFaq(auth.db, id, auth.businessId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
