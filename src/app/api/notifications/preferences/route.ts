import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getSession, isAdmin } from '@/lib/auth/session';
import {
  getPreferences,
  setPreference,
  ALL_NOTIFICATION_TYPES,
  ADMIN_ONLY_TYPES,
  type NotificationType,
} from '@/lib/db/queries/notifications';

const patchSchema = z.object({
  type: z.enum(ALL_NOTIFICATION_TYPES as [NotificationType, ...NotificationType[]]),
  inApp: z.boolean(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb(getD1Database());
    const prefs = await getPreferences(db, session.userId);
    const userIsAdmin = await isAdmin(session.userId);

    // Strip admin-only types from non-admin responses so the prefs UI doesn't
    // show toggles the user can't act on.
    const filtered: Partial<Record<NotificationType, boolean>> = {};
    for (const type of ALL_NOTIFICATION_TYPES) {
      if (ADMIN_ONLY_TYPES.includes(type) && !userIsAdmin) continue;
      filtered[type] = prefs[type];
    }

    const res = NextResponse.json({ preferences: filtered, isAdmin: userIsAdmin });
    res.headers.set('Cache-Control', 'private, no-store');
    return res;
  } catch (err) {
    console.error('[api/notifications/preferences] GET failed', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Block non-admins from toggling admin-only types — they shouldn't have
    // these in the UI anyway, but guard the API too.
    if (ADMIN_ONLY_TYPES.includes(parsed.data.type)) {
      const userIsAdmin = await isAdmin(session.userId);
      if (!userIsAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = getDb(getD1Database());
    await setPreference(db, session.userId, parsed.data.type, parsed.data.inApp);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/notifications/preferences] PATCH failed', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
