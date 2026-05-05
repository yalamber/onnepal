import { NextResponse } from 'next/server';
import { getApprovedReviews, createReview, getAverageRating } from '@/lib/db/queries/reviews';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { reviews, businesses } from '@/lib/db/schema';
import { eq, and, gte, count } from 'drizzle-orm';
import { createNotification } from '@/lib/db/queries/notifications';

// Public route — returns approved reviews only
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const d1 = getD1Database();
    const db = getDb(d1);

    const [items, rating] = await Promise.all([
      getApprovedReviews(db, businessId),
      getAverageRating(db, businessId),
    ]);

    return NextResponse.json({ reviews: items, rating });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Public route — submit a review
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const businessId = url.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const body = (await request.json()) as {
      reviewerName?: string;
      reviewerEmail?: string;
      rating?: number;
      content?: string;
    };

    if (!body.reviewerName || typeof body.reviewerName !== 'string') {
      return NextResponse.json({ error: 'Reviewer name is required' }, { status: 400 });
    }
    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const d1 = getD1Database();
    const db = getDb(d1);

    // Rate limit: max 5 reviews per business per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(eq(reviews.businessId, businessId), gte(reviews.createdAt, oneDayAgo)));

    if (recentCount && recentCount.count >= 5) {
      return NextResponse.json(
        { error: 'Too many reviews for this business today. Please try again later.' },
        { status: 429 }
      );
    }

    const result = await createReview(db, businessId, {
      reviewerName: body.reviewerName,
      reviewerEmail: body.reviewerEmail || undefined,
      rating: body.rating,
      content: body.content || undefined,
    });

    // Notify the business owner.
    const biz = await db
      .select({ userId: businesses.userId, name: businesses.businessName })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);
    if (biz[0]) {
      const stars = '★'.repeat(body.rating) + '☆'.repeat(5 - body.rating);
      await createNotification(db, {
        userId: biz[0].userId,
        type: 'review_received',
        title: `New ${body.rating}-star review on ${biz[0].name}`,
        body: `${stars} from ${body.reviewerName}${body.content ? `: "${body.content.slice(0, 100)}${body.content.length > 100 ? '…' : ''}"` : ''}`,
        linkHref: '/dashboard/reviews',
      });
    }

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
