import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getEvents, getEventsCount } from '@/lib/db/queries/events';
import EventsClient from './events-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events in Nepal — Discover What\'s Happening',
  description: 'Find events happening in Nepal. Concerts, festivals, workshops, sports, and more.',
  openGraph: { title: 'Events in Nepal', description: 'Discover events happening in Nepal.' },
};


export default async function EventsPage() {
  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getEvents(db, { page: 1, limit: 12 }),
      getEventsCount(db, {}),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('Events SSR error:', e);
  }

  return <EventsClient initialData={initialData} />;
}
