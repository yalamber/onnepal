import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getClassifieds, getClassifiedsCount, getClassifiedCategories } from '@/lib/db/queries/classifieds';
import { unstable_cache } from 'next/cache';
import ClassifiedsClient from './classifieds-client';

export const revalidate = 300;

const getInitialData = unstable_cache(
  async () => {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [listings, total, categories] = await Promise.all([
      getClassifieds(db, { page: 1, limit: 12 }),
      getClassifiedsCount(db, {}),
      getClassifiedCategories(db),
    ]);
    return { listings, total, categories };
  },
  ['classifieds-initial'],
  { revalidate: 300 },
);

export default async function ClassifiedsPage() {
  const initialData = await getInitialData();
  return <ClassifiedsClient initialData={initialData} />;
}
