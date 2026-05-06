import { and, desc, eq, sql } from 'drizzle-orm';
import { notifications, notificationPreferences, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

// `message_received` was removed in favour of the dedicated MessagesBell which
// owns the unread-thread badge for messages. Existing rows in the DB with
// type='message_received' keep working (they'll render with the fallback
// icon/tone in the UI). New events of that kind no longer flow into the bell.
export type NotificationType =
  | 'review_received'
  | 'booking_received'
  | 'comment_received'
  | 'voice_approved'
  | 'voice_rejected'
  | 'voice_pending'   // admin-only
  | 'report_received'; // admin-only

export const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  'review_received',
  'booking_received',
  'comment_received',
  'voice_approved',
  'voice_rejected',
  'voice_pending',
  'report_received',
];

// Human-readable labels used in the prefs UI and the popover empty-state
// fallback when a notification has a type we somehow forgot to label.
export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  review_received: 'New reviews on my businesses',
  booking_received: 'New booking inquiries',
  comment_received: 'Replies and comments',
  voice_approved: 'When my voice is published',
  voice_rejected: 'When my voice is rejected',
  voice_pending: 'New voices to moderate',
  report_received: 'New reports to review',
};

// Admin-only types — these are inserted into rows for users where is_admin = 1
// and should be hidden in the prefs UI for non-admins.
export const ADMIN_ONLY_TYPES: NotificationType[] = ['voice_pending', 'report_received'];

export interface NotificationRow {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  linkHref: string | null;
  isRead: boolean;
  createdAt: number;
}

function toMs(v: Date | number | null | undefined): number {
  if (v == null) return 0;
  return v instanceof Date ? v.getTime() : Number(v);
}

function rowToNotification(r: typeof notifications.$inferSelect): NotificationRow {
  return {
    id: r.id,
    userId: r.userId,
    type: r.type as NotificationType,
    title: r.title,
    body: r.body,
    linkHref: r.linkHref,
    isRead: r.isRead,
    createdAt: toMs(r.createdAt),
  };
}

interface CreateInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  linkHref?: string | null;
}

/**
 * Insert a notification, gated by the user's preference for this type.
 * If the user has explicitly opted out (in_app = false) we skip silently.
 *
 * Best-effort: any errors (DB unavailable, table missing pre-migration) are
 * swallowed so the calling event handler isn't blocked from completing.
 */
export async function createNotification(db: Database, input: CreateInput): Promise<void> {
  try {
    // Check opt-out. No row → default ON.
    const pref = await db
      .select({ inApp: notificationPreferences.inApp })
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, input.userId),
          eq(notificationPreferences.type, input.type),
        ),
      )
      .limit(1);
    if (pref[0] && pref[0].inApp === false) return; // opted out

    await db.insert(notifications).values({
      id: generateId(),
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      linkHref: input.linkHref ?? null,
      isRead: false,
      createdAt: new Date(),
    });
  } catch (err) {
    // Non-fatal — log and move on. The calling flow shouldn't 500 because the
    // notification couldn't be persisted.
    console.error('[notifications] createNotification failed', {
      userId: input.userId,
      type: input.type,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Fan-out helper for admin-only notification types — inserts one notification
 * per is_admin user. Use for voice_pending, report_received.
 */
export async function notifyAllAdmins(db: Database, input: Omit<CreateInput, 'userId'>): Promise<void> {
  try {
    const admins = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.isAdmin, true));
    await Promise.all(admins.map((a) => createNotification(db, { ...input, userId: a.id })));
  } catch (err) {
    console.error('[notifications] notifyAllAdmins failed', err);
  }
}

export async function getUnreadCount(db: Database, userId: string): Promise<number> {
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return Number(rows[0]?.c ?? 0);
}

export async function getNotifications(
  db: Database,
  userId: string,
  opts: { unreadOnly?: boolean; page?: number; limit?: number } = {},
): Promise<NotificationRow[]> {
  const { unreadOnly = false, page = 1, limit = 20 } = opts;
  const offset = (page - 1) * limit;
  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) conditions.push(eq(notifications.isRead, false));

  const rows = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
  return rows.map(rowToNotification);
}

export async function getNotificationsCount(db: Database, userId: string, opts: { unreadOnly?: boolean } = {}): Promise<number> {
  const conditions = [eq(notifications.userId, userId)];
  if (opts.unreadOnly) conditions.push(eq(notifications.isRead, false));
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(notifications)
    .where(and(...conditions));
  return Number(rows[0]?.c ?? 0);
}

export async function markAsRead(db: Database, userId: string, id: string): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllAsRead(db: Database, userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// ---- Preferences -----------------------------------------------------------

export type PreferenceRecord = Record<NotificationType, boolean>;

export async function getPreferences(db: Database, userId: string): Promise<PreferenceRecord> {
  const rows = await db
    .select({ type: notificationPreferences.type, inApp: notificationPreferences.inApp })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
  const map: PreferenceRecord = Object.fromEntries(
    ALL_NOTIFICATION_TYPES.map((t) => [t, true]),
  ) as PreferenceRecord;
  for (const r of rows) {
    if ((ALL_NOTIFICATION_TYPES as string[]).includes(r.type)) {
      map[r.type as NotificationType] = r.inApp;
    }
  }
  return map;
}

export async function setPreference(db: Database, userId: string, type: NotificationType, inApp: boolean): Promise<void> {
  // Upsert. SQLite doesn't have ON CONFLICT-friendly drizzle helpers across
  // versions, so do a SELECT-then-UPDATE-or-INSERT.
  const existing = await db
    .select({ id: notificationPreferences.id })
    .from(notificationPreferences)
    .where(and(
      eq(notificationPreferences.userId, userId),
      eq(notificationPreferences.type, type),
    ))
    .limit(1);
  const now = new Date();
  if (existing[0]) {
    await db
      .update(notificationPreferences)
      .set({ inApp, updatedAt: now })
      .where(eq(notificationPreferences.id, existing[0].id));
  } else {
    await db.insert(notificationPreferences).values({
      id: generateId(),
      userId,
      type,
      inApp,
      createdAt: now,
      updatedAt: now,
    });
  }
}
