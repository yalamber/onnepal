import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getLostFoundItems, getLostFoundCount } from '@/lib/db/queries/lost-found';
import { unstable_cache } from 'next/cache';
import LostFoundClient from './lost-found-client';

export const revalidate = 300;

const getInitialData = unstable_cache(
  async () => {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getLostFoundItems(db, { page: 1, limit: 12 }),
      getLostFoundCount(db, {}),
    ]);
    return { items, total };
  },
  ['lost-found-initial'],
  { revalidate: 300 },
);

export default async function LostFoundPage() {
  const data = await getInitialData();
  const initialData = {
    items: data.items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
    total: data.total,
  };
  return <LostFoundClient initialData={initialData} />;
}
