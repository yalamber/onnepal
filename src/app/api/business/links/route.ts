import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { getSocialLinks, createSocialLink } from '@/lib/db/queries/links';
import { getSession } from '@/lib/auth/session';
import { socialLinkSchema } from '@/lib/validators/business';
import { updateOnboardingStep, getUserById } from '@/lib/db/queries/users';

export async function GET() {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const d1 = await getD1Database();
    const db = getDb(d1);
    const links = await getSocialLinks(db, session.userId);

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Get links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const env = await getCloudflareEnv();
    const session = await getSession(env.JWT_SECRET);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = socialLinkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const d1 = await getD1Database();
    const db = getDb(d1);
    const result = await createSocialLink(db, session.userId, validation.data);

    // Advance onboarding if at step 2
    const user = await getUserById(db, session.userId);
    if (user && user.onboardingStep === 2) {
      await updateOnboardingStep(db, session.userId, 3);
    }

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
