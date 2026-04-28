import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { updateUser } from '@/lib/db/queries/users';
import { z } from 'zod';

const profilePatchSchema = z.object({
  displayName: z.string().min(1).max(100).nullish(),
  phone: z.string().max(20).nullish(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const raw = await request.json();
    const validation = profilePatchSchema.safeParse(raw);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const body = validation.data;
    const d1 = getD1Database();
    const db = getDb(d1);

    await updateUser(db, session.userId, {
      displayName: body.displayName,
      phone: body.phone,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
