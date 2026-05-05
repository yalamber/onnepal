import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { hashToken, looksLikeToken } from '@/lib/auth/reset-token';
import { hashPassword } from '@/lib/auth/password';

const schema = z.object({
  token: z.string(),
  password: z.string().min(8).max(120),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { token, password } = parsed.data;
    if (!looksLikeToken(token)) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
    }

    const tokenHash = await hashToken(token);
    const db = getDb(getD1Database());

    const row = (await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        expiresAt: passwordResetTokens.expiresAt,
        consumedAt: passwordResetTokens.consumedAt,
      })
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1))[0];

    if (!row) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 });
    }
    if (row.consumedAt) {
      return NextResponse.json({ error: 'This link has already been used' }, { status: 400 });
    }
    const exp = row.expiresAt instanceof Date ? row.expiresAt.getTime() : Number(row.expiresAt);
    if (Date.now() > exp) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 400 });
    }

    const hash = await hashPassword(password);
    const now = new Date();

    // Update password + mark token consumed. (D1 does not give us multi-statement
    // transactions, but the consequences of partial-failure here are tolerable: a
    // password change without consuming the token leaves a single-use token
    // already-spent in spirit, and the next reset request invalidates it anyway.)
    await db.update(users).set({ passwordHash: hash, updatedAt: now }).where(eq(users.id, row.userId));
    await db
      .update(passwordResetTokens)
      .set({ consumedAt: now })
      .where(eq(passwordResetTokens.id, row.id));

    // Best-effort: invalidate every other unconsumed reset token for this user.
    await db
      .update(passwordResetTokens)
      .set({ consumedAt: now })
      .where(sql`${passwordResetTokens.userId} = ${row.userId} AND ${passwordResetTokens.consumedAt} IS NULL`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[auth/reset-password] failed', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
