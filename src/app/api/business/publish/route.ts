import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { publishSite, updateOnboardingStep, getUserById } from '@/lib/db/queries/users';
import { getSession } from '@/lib/auth/session';

export async function POST() {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);

    await publishSite(db, session.userId);

    const user = await getUserById(db, session.userId);
    if (user && user.onboardingStep < 4) {
      await updateOnboardingStep(db, session.userId, 4);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
