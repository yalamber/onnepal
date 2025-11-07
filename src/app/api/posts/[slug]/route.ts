import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { getPostBySlug, updatePost, deletePost, incrementViewCount } from '@/lib/db/queries/posts';
import { getPostTags } from '@/lib/db/queries/tags';
import { getSession } from '@/lib/auth/session';
import { updatePostSchema } from '@/lib/validators/post';

// GET /api/posts/[slug] - Get post by slug
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);

    const result = await getPostBySlug(db, slug);

    if (!result) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count
    await incrementViewCount(db, result.post.id);

    // Get tags
    const tags = await getPostTags(db, result.post.id);

    return NextResponse.json({
      post: result.post,
      author: result.author,
      tags,
    });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/posts/[slug] - Update post
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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

    // Check if user is the author or admin
    if (result.post.authorId !== session.userId && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const validation = updatePostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    await updatePost(db, result.post.id, validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/posts/[slug] - Delete post
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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

    // Check if user is the author or admin
    if (result.post.authorId !== session.userId && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deletePost(db, result.post.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
