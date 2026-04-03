import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { getUserById } from '@/lib/db/queries/users';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);

    const user = await getUserById(db, session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        subdomain: user.subdomain,
        businessName: user.businessName,
        businessCategory: user.businessCategory,
        description: user.description,
        logoUrl: user.logoUrl,
        coverImageUrl: user.coverImageUrl,
        phone: user.phone,
        address: user.address,
        businessHours: user.businessHours,
        primaryColor: user.primaryColor,
        accentColor: user.accentColor,
        isPublished: user.isPublished,
        onboardingStep: user.onboardingStep,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
