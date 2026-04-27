import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getJobs, getJobsCount } from '@/lib/db/queries/jobs';
import { unstable_cache } from 'next/cache';
import JobsClient from './jobs-client';

export const revalidate = 300;

const getInitialData = unstable_cache(
  async () => {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getJobs(db, { page: 1, limit: 12 }),
      getJobsCount(db, {}),
    ]);
    return { items, total };
  },
  ['jobs-initial'],
  { revalidate: 300 },
);

export default async function JobsPage() {
  const initialData = await getInitialData();
  return <JobsClient initialData={initialData} />;
}
