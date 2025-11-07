import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { getUserPosts } from '@/lib/db/queries/posts';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);

    const posts = await getUserPosts(db, session.userId);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
