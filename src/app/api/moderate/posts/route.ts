import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { getPendingPosts } from '@/lib/db/queries/posts';
import { getSession } from '@/lib/auth/session';

// GET /api/moderate/posts - Get pending posts for moderation
export async function GET() {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is moderator or admin
    if (session.role !== 'moderator' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Moderator access required' }, { status: 403 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);

    const posts = await getPendingPosts(db);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get pending posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
