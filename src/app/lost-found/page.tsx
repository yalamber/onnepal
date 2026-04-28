import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getLostFoundItems, getLostFoundCount } from '@/lib/db/queries/lost-found';
import LostFoundClient from './lost-found-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lost & Found Nepal — Help Reunite Lost Items',
  description: 'Report lost or found items in Nepal. Help reunite pets, documents, electronics, and valuables with their owners.',
  openGraph: { title: 'Lost & Found Nepal', description: 'Report lost or found items in Nepal.' },
};


export default async function LostFoundPage() {
  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getLostFoundItems(db, { page: 1, limit: 12 }),
      getLostFoundCount(db, {}),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('LostFound SSR error:', e);
  }

  return <LostFoundClient initialData={initialData} />;
}
