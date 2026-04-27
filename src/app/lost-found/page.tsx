import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getLostFoundItems, getLostFoundCount } from '@/lib/db/queries/lost-found';
import LostFoundClient from './lost-found-client';


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
