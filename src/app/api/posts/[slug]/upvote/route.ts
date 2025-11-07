import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { getPostBySlug } from '@/lib/db/queries/posts';
import { addUpvote, removeUpvote, hasUserUpvoted } from '@/lib/db/queries/upvotes';
import { getSession } from '@/lib/auth/session';

// POST /api/posts/[slug]/upvote - Toggle upvote
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);

    const result = await getPostBySlug(db, slug);

    if (!result) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already upvoted
    const alreadyUpvoted = await hasUserUpvoted(db, session.userId, result.post.id);

    if (alreadyUpvoted) {
      // Remove upvote
      await removeUpvote(db, session.userId, result.post.id);
      return NextResponse.json({ success: true, upvoted: false });
    } else {
      // Add upvote
      await addUpvote(db, session.userId, result.post.id);
      return NextResponse.json({ success: true, upvoted: true });
    }
  } catch (error) {
    console.error('Upvote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/posts/[slug]/upvote - Check if user upvoted
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);

    if (!session) {
      return NextResponse.json({ upvoted: false });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);

    const result = await getPostBySlug(db, slug);

    if (!result) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const upvoted = await hasUserUpvoted(db, session.userId, result.post.id);

    return NextResponse.json({ upvoted });
  } catch (error) {
    console.error('Check upvote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
