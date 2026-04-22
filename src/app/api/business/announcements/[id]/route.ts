import { NextResponse } from 'next/server';
import { updateAnnouncement, deleteAnnouncement } from '@/lib/db/queries/announcements';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';
import { announcementSchema } from '@/lib/validators/business';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const validation = announcementSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    await updateAnnouncement(auth.db, id, validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update announcement error:', error);
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
    await deleteAnnouncement(auth.db, id, auth.businessId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
