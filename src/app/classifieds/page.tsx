import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getClassifieds, getClassifiedsCount, getClassifiedCategories } from '@/lib/db/queries/classifieds';
import ClassifiedsClient from './classifieds-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Classifieds — Buy & Sell in Nepal',
  description: 'Browse classified ads in Nepal. Buy, sell, or offer services. Post your ad for free.',
  openGraph: { title: 'Classifieds — Buy & Sell in Nepal', description: 'Browse classified ads in Nepal.' },
};


export default async function ClassifiedsPage() {
  let initialData = { listings: [] as any[], total: 0, categories: [] as any[] };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [listings, total, categories] = await Promise.all([
      getClassifieds(db, { page: 1, limit: 12 }),
      getClassifiedsCount(db, {}),
      getClassifiedCategories(db),
    ]);
    initialData = {
      listings: listings.map(l => ({ ...l, createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt) })),
      total,
      categories,
    };
  } catch (e) {
    console.error('Classifieds SSR error:', e);
  }

  return <ClassifiedsClient initialData={initialData} />;
}
