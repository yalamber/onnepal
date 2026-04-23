import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/db/queries/users';

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const d1 = getD1Database();
  const db = getDb(d1);
  const user = await getUserById(db, session.userId);

  if (!user || !user.isAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { session, db, user };
}
