import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getServices, getServicesCount } from '@/lib/db/queries/services';
import ServicesClient from './services-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Local Pros in Nepal — Find Local Service Providers',
  description: 'Find trusted local professionals in Nepal for any task. Home services, tutoring, repair, photography, IT support, and more.',
  openGraph: { title: 'Local Pros in Nepal', description: 'Find trusted local service providers across Nepal.' },
};

export default async function ServicesPage() {
  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getServices(db, { page: 1, limit: 12 }),
      getServicesCount(db, {}),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('Pros SSR error:', e);
  }

  return <ServicesClient initialData={initialData} />;
}
