import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getUserPublicProfile, getUserListings } from '@/lib/db/queries/user-profile';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb(getD1Database());

    const [user, listings] = await Promise.all([
      getUserPublicProfile(db, id),
      getUserListings(db, id),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const res = NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
      },
      businesses: listings.businesses,
      classifieds: listings.classifieds.map((i) => ({
        ...i,
        createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt),
      })),
      jobs: listings.jobs.map((i) => ({
        ...i,
        createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt),
      })),
      events: listings.events.map((i) => ({
        ...i,
        createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt),
      })),
      places: listings.places.map((i) => ({
        ...i,
        createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt),
      })),
    });
    res.headers.set('Cache-Control', 'public, s-maxage=300');
    return res;
  } catch (error) {
    console.error('User profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
