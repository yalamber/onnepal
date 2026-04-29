import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getJobs, getJobsCount } from '@/lib/db/queries/jobs';
import { JOB_CATEGORIES } from '@/lib/job-categories';
import JobsClient from '../../jobs-client';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = JOB_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return { title: 'Jobs in Nepal' };
  return {
    title: `${cat.name} Jobs in Nepal`,
    description: `Browse ${cat.name} jobs in Nepal. Find full-time, part-time, remote, and freelance opportunities.`,
    openGraph: { title: `${cat.name} Jobs in Nepal`, description: `Browse ${cat.name} jobs in Nepal.` },
  };
}

export default async function JobCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = JOB_CATEGORIES.find(c => c.slug === slug);
  const categoryName = cat?.name || '';

  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getJobs(db, { category: categoryName, page: 1, limit: 12 }),
      getJobsCount(db, { category: categoryName }),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('Jobs category SSR error:', e);
  }

  return <JobsClient initialData={initialData} initialCategory={slug} />;
}
