import { NextRequest, NextResponse } from 'next/server';
import { getR2Bucket, getD1Database } from '@/lib/cloudflare';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { generateId } from '@/lib/utils';
import { getBusinessById, updateBusinessProfile } from '@/lib/db/queries/businesses';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const target = formData.get('target') as string | null;
    const businessId = formData.get('businessId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF are allowed' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 });
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const key = `${session.userId}/${generateId()}.${ext}`;

    const bucket = getR2Bucket();
    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    if (target && businessId && (target === 'logo' || target === 'cover')) {
      const d1 = getD1Database();
      const db = getDb(d1);
      const biz = await getBusinessById(db, businessId);
      if (biz && biz.userId === session.userId) {
        const update = target === 'logo' ? { logoUrl: key } : { coverImageUrl: key };
        await updateBusinessProfile(db, businessId, update);
      }
    }

    return NextResponse.json({ url: key, key });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
