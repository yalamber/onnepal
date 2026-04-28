import { NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/db/queries/bookings';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const body = (await request.json()) as { status?: string };

    if (!body.status || !['confirmed', 'cancelled'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be "confirmed" or "cancelled"' },
        { status: 400 }
      );
    }

    await updateBookingStatus(auth.db, id, body.status as 'confirmed' | 'cancelled', auth.businessId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update booking status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
