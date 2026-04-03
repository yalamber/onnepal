import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { getUserById, updateUserProfile, updateOnboardingStep } from '@/lib/db/queries/users';
import { getSession } from '@/lib/auth/session';
import { updateProfileSchema } from '@/lib/validators/business';

export async function GET() {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);
    const user = await getUserById(db, session.userId);
    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const d1 = await getD1Database();
    const db = getDb(d1);

    await updateUserProfile(db, session.userId, validation.data);

    // If this is during onboarding step 2, advance to step 3
    const user = await getUserById(db, session.userId);
    if (user && user.onboardingStep === 1) {
      await updateOnboardingStep(db, session.userId, 2);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
