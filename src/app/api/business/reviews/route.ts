import { NextResponse } from 'next/server';
import { getApprovedReviews, createReview, getAverageRating } from '@/lib/db/queries/reviews';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';

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

    const result = await createReview(db, businessId, {
      reviewerName: body.reviewerName,
      reviewerEmail: body.reviewerEmail || undefined,
      rating: body.rating,
      content: body.content || undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
