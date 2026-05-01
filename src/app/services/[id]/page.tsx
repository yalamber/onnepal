import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getServiceById } from '@/lib/db/queries/services';
import ServiceDetail from './service-detail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb(getD1Database());
    const item = await getServiceById(db, id);
    if (!item) return { title: 'Not Found' };
    return {
      title: `${item.title} — Service on OnNepal`,
      description: item.description?.slice(0, 160) || `${item.title} — find this service on OnNepal`,
    };
  } catch { return { title: 'Service' }; }
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;

  try {
    const db = getDb(getD1Database());
    const item = await getServiceById(db, id);
    if (item) {
      initialData = {
        ...item,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
      };
    }
  } catch {}

  return <ServiceDetail initialData={initialData} />;
}
