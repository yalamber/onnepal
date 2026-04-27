import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getEvents, getEventsCount } from '@/lib/db/queries/events';
import { unstable_cache } from 'next/cache';
import EventsClient from './events-client';

export const revalidate = 300;

const getInitialData = unstable_cache(
  async () => {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getEvents(db, { page: 1, limit: 12 }),
      getEventsCount(db, {}),
    ]);
    return { items, total };
  },
  ['events-initial'],
  { revalidate: 300 },
);

export default async function EventsPage() {
  const data = await getInitialData();
  const initialData = {
    items: data.items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
    total: data.total,
  };
  return <EventsClient initialData={initialData} />;
}
