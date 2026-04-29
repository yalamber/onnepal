import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getJobById } from '@/lib/db/queries/jobs';
import JobDetail from './job-detail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb(getD1Database());
    const item = await getJobById(db, id);
    if (!item) return { title: 'Not Found' };
    return {
      title: `${item.title} at ${item.company}`,
      description: item.description?.slice(0, 160) || `${item.title} at ${item.company} — job on OnNepal`,
      openGraph: {
        title: `${item.title} at ${item.company}`,
        description: item.description?.slice(0, 160) || `${item.title} at ${item.company}`,
        type: 'website',
      },
    };
  } catch { return { title: 'Job' }; }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;
  try {
    const db = getDb(getD1Database());
    const item = await getJobById(db, id);
    if (item) {
      initialData = { ...item, createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt) };
    }
  } catch {}

  const jsonLd = initialData ? {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: initialData.title,
    description: initialData.description || undefined,
    hiringOrganization: { '@type': 'Organization', name: initialData.company },
    datePosted: initialData.createdAt,
    ...(initialData.location && { jobLocation: { '@type': 'Place', address: initialData.location } }),
    ...(initialData.salary && { baseSalary: { '@type': 'MonetaryAmount', currency: 'NPR', value: initialData.salary } }),
    employmentType: (initialData.type || 'full-time').toUpperCase().replace('-', '_'),
  } : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <JobDetail initialData={initialData} />
    </>
  );
}
