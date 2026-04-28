import { eq, and, desc } from 'drizzle-orm';
import { bookings } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getBookings(db: Database, businessId: string) {
  return db
    .select()
    .from(bookings)
    .where(eq(bookings.businessId, businessId))
    .orderBy(desc(bookings.createdAt));
}

export async function getPendingBookings(db: Database, businessId: string) {
  return db
    .select()
    .from(bookings)
    .where(and(eq(bookings.businessId, businessId), eq(bookings.status, 'pending')))
    .orderBy(desc(bookings.createdAt));
}

export async function createBooking(
  db: Database,
  businessId: string,
  data: {
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    date: string;
    time?: string;
    service?: string;
    message?: string;
  }
) {
  const id = generateId();
  const now = new Date();

  await db.insert(bookings).values({
    id,
    businessId,
    customerName: data.customerName,
    customerPhone: data.customerPhone || null,
    customerEmail: data.customerEmail || null,
    date: data.date,
    time: data.time || null,
    service: data.service || null,
    message: data.message || null,
    status: 'pending',
    createdAt: now,
  });

  return { id };
}

export async function updateBookingStatus(
  db: Database,
  id: string,
  status: 'confirmed' | 'cancelled',
  businessId: string
) {
  await db
    .update(bookings)
    .set({ status })
    .where(and(eq(bookings.id, id), eq(bookings.businessId, businessId)));
}
