import { NextRequest, NextResponse } from 'next/server';
import { getR2Bucket, getCloudflareEnv } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
// POST /api/upload - Upload image to R2
export async function POST(request: NextRequest) {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max size is 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const key = `images/${filename}`;

    // Upload to R2
    const r2 = await getR2Bucket();
    const arrayBuffer = await file.arrayBuffer();
    await r2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Return public URL (you'll need to configure R2 public access or use a custom domain)
    const url = `https://images.onnepal.com/${key}`;

    return NextResponse.json({
      success: true,
      url,
      key,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
