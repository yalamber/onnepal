import { NextResponse } from 'next/server';
import { updateMenuItem, deleteMenuItem } from '@/lib/db/queries/menu';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = (await request.json()) as Partial<{
      name: string;
      description: string;
      price: string;
      category: string;
      imageKey: string;
      isAvailable: boolean;
    }>;

    await updateMenuItem(auth.db, id, auth.businessId, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update menu item error:', error);
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
    await deleteMenuItem(auth.db, id, auth.businessId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete menu item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
