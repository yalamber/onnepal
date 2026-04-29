import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getPlaces, getPlacesCount } from '@/lib/db/queries/places';
import PlacesClient from './places-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Places — Discover Hidden Gems in Nepal',
  description: 'Explore temples, trekking trails, lakes, viewpoints, and hidden gems across Nepal.',
  openGraph: { title: 'Places in Nepal', description: 'Discover hidden gems across Nepal.' },
};

export default async function PlacesPage() {
  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getPlaces(db, { page: 1, limit: 12 }),
      getPlacesCount(db, {}),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('Places SSR error:', e);
  }

  return <PlacesClient initialData={initialData} />;
}
