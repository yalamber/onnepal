import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { createPost, getRecentPosts } from '@/lib/db/queries/posts';
import { getSession } from '@/lib/auth/session';
import { createPostSchema } from '@/lib/validators/post';

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const d1 = await getD1Database();
    const db = getDb(d1);

    const posts = await getRecentPosts(db, limit, offset);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = createPostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, content, excerpt, coverImageUrl, tagIds } = validation.data;

    const d1 = await getD1Database();
    const db = getDb(d1);

    // Create post
    const result = await createPost(db, {
      authorId: session.userId,
      title,
      content,
      excerpt,
      coverImageUrl,
      tagIds,
    });

    return NextResponse.json(
      {
        success: true,
        post: {
          id: result.id,
          slug: result.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
