import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getJobs, getJobsCount } from '@/lib/db/queries/jobs';
import JobsClient from './jobs-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jobs in Nepal — Find Your Next Opportunity',
  description: 'Browse job listings in Nepal. Full-time, part-time, remote, and freelance opportunities.',
  openGraph: { title: 'Jobs in Nepal', description: 'Find your next opportunity in Nepal.' },
};


export default async function JobsPage() {
  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getJobs(db, { page: 1, limit: 12 }),
      getJobsCount(db, {}),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('Jobs SSR error:', e);
  }

  return <JobsClient initialData={initialData} />;
}
