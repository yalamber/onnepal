import { eq, and, or, desc, sql } from 'drizzle-orm';
import { messages, users } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function sendMessage(
  db: Database,
  data: { senderId: string; recipientId: string; listingType: string; listingId: string; listingTitle: string; content: string }
) {
  const id = generateId();
  await db.insert(messages).values({ id, ...data, isRead: false, createdAt: new Date() });
  return { id };
}

export async function getConversations(db: Database, userId: string) {
  const msgs = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      listingType: messages.listingType,
      listingId: messages.listingId,
      listingTitle: messages.listingTitle,
      content: messages.content,
      isRead: messages.isRead,
      createdAt: messages.createdAt,
      senderName: users.displayName,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
    .orderBy(desc(messages.createdAt))
    .limit(1000);

  const convMap = new Map<string, {
    otherUserId: string;
    otherUserName: string | null;
    listingType: string;
    listingId: string;
    listingTitle: string;
    lastMessage: string;
    lastAt: Date;
    unread: number;
  }>();

  for (const m of msgs) {
    const otherUserId = m.senderId === userId ? m.recipientId : m.senderId;
    const key = `${otherUserId}:${m.listingType}:${m.listingId}`;
    if (!convMap.has(key)) {
      convMap.set(key, {
        otherUserId,
        otherUserName: m.senderId === userId ? null : m.senderName,
        listingType: m.listingType,
        listingId: m.listingId,
        listingTitle: m.listingTitle,
        lastMessage: m.content,
        lastAt: m.createdAt,
        unread: 0,
      });
    }
    const conv = convMap.get(key)!;
    if (!conv.otherUserName && m.senderId !== userId && m.senderName) {
      conv.otherUserName = m.senderName;
    }
    if (m.recipientId === userId && !m.isRead) {
      conv.unread++;
    }
  }

  return Array.from(convMap.values());
}

export async function getThread(db: Database, userId: string, otherUserId: string, listingType: string, listingId: string) {
  return db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      content: messages.content,
      createdAt: messages.createdAt,
      senderName: users.displayName,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(and(
      eq(messages.listingType, listingType),
      eq(messages.listingId, listingId),
      or(
        and(eq(messages.senderId, userId), eq(messages.recipientId, otherUserId)),
        and(eq(messages.senderId, otherUserId), eq(messages.recipientId, userId)),
      ),
    ))
    .orderBy(messages.createdAt)
    .limit(200);
}

export async function markAsRead(db: Database, userId: string, senderId: string, listingType: string, listingId: string) {
  await db.update(messages)
    .set({ isRead: true })
    .where(and(
      eq(messages.recipientId, userId),
      eq(messages.senderId, senderId),
      eq(messages.listingType, listingType),
      eq(messages.listingId, listingId),
      eq(messages.isRead, false),
    ));
}
