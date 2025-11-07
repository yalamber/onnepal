import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getFeaturedPosts } from '@/lib/db/queries/posts';

// GET /api/posts/featured - Get featured posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const d1 = await getD1Database();
    const db = getDb(d1);

    const posts = await getFeaturedPosts(db, limit);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get featured posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
