import { NextResponse } from 'next/server';
import { getGalleryImages, addGalleryImage } from '@/lib/db/queries/gallery';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const images = await getGalleryImages(auth.db, auth.businessId);

    return NextResponse.json({ gallery: images });
  } catch (error) {
    console.error('Get gallery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const body = (await request.json()) as { imageKey?: string; caption?: string };

    if (!body.imageKey || typeof body.imageKey !== 'string') {
      return NextResponse.json({ error: 'imageKey is required' }, { status: 400 });
    }

    const result = await addGalleryImage(auth.db, auth.businessId, {
      imageKey: body.imageKey,
      caption: body.caption || undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Add gallery image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
