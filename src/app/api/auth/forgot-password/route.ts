import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq, gt, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { generateRawToken, hashToken } from '@/lib/auth/reset-token';
import { sendEmail } from '@/lib/email';
import { passwordResetEmail } from '@/lib/email-templates';
import { generateId } from '@/lib/utils';

const TTL_MINUTES = 60;
// Cap at 3 reset requests per user per hour to slow brute-forcers / mailbombs.
const RATE_LIMIT_PER_HOUR = 3;

const schema = z.object({
  email: z.string().email().max(200),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    const email = parsed.data.email.trim().toLowerCase();

    const db = getDb(getD1Database());
    const user = (await db.select({ id: users.id, email: users.email, displayName: users.displayName }).from(users).where(eq(users.email, email)).limit(1))[0];

    // Always return 200 — leaking which emails are registered is the bigger
    // risk here than UX clarity. The form will say "if there's an account…".
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Rate limit by counting recent tokens issued to this user. Use Drizzle's
    // typed comparators so the Date column binds correctly through D1.
    const oneHourAgo = new Date(Date.now() - 3600_000);
    const recent = await db
      .select({ c: sql<number>`count(*)` })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          gt(passwordResetTokens.createdAt, oneHourAgo),
        ),
      );
    const recentCount = Number(recent[0]?.c ?? 0);
    if (recentCount >= RATE_LIMIT_PER_HOUR) {
      // Pretend success — don't disclose state to the requester.
      return NextResponse.json({ ok: true });
    }

    const rawToken = generateRawToken();
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000);

    await db.insert(passwordResetTokens).values({
      id: generateId(),
      userId: user.id,
      tokenHash,
      expiresAt,
      consumedAt: null,
      createdAt: new Date(),
    });

    // Build absolute reset URL. Use the request origin so dev and preview work.
    // Fall back to onnepal.com production.
    const origin = request.nextUrl.origin || 'https://onnepal.com';
    const resetUrl = `${origin}/reset-password/${rawToken}`;

    const tpl = passwordResetEmail({
      resetUrl,
      displayName: user.displayName ?? null,
      expiresInMinutes: TTL_MINUTES,
    });

    // Don't await rejection: sendEmail already swallows errors. Keep response fast.
    await sendEmail({ to: user.email, subject: tpl.subject, html: tpl.html, text: tpl.text });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[auth/forgot-password] failed', error);
    // Same generic response on internal error to avoid signalling state.
    return NextResponse.json({ ok: true });
  }
}

