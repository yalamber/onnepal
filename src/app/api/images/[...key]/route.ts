import { NextRequest, NextResponse } from 'next/server';
import { getR2Bucket } from '@/lib/cloudflare';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const objectKey = key.join('/');

    const bucket = getR2Bucket();
    const object = await bucket.get(objectKey);

    if (!object) {
      return new NextResponse('Not found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(object.body as ReadableStream, { headers });
  } catch {
    return new NextResponse('Error', { status: 500 });
  }
}
