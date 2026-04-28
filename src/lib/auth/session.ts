import { cookies } from 'next/headers';
import { verifyToken, type TokenPayload } from './jwt';
import { getJwtSecret, getD1Database } from '@/lib/cloudflare';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const AUTH_COOKIE_NAME = 'auth_token';

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token, getJwtSecret());
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const result = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, userId)).limit(1);
    return result[0]?.isAdmin === true;
  } catch { return false; }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
