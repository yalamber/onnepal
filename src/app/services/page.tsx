import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getServices, getServicesCount } from '@/lib/db/queries/services';
import ServicesClient from './services-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services in Nepal — Find Local Service Providers',
  description: 'Find trusted local service providers in Nepal. Home services, tutoring, repair, photography, IT support, and more.',
  openGraph: { title: 'Services in Nepal', description: 'Find trusted local service providers across Nepal.' },
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
    console.error('Services SSR error:', e);
  }

  return <ServicesClient initialData={initialData} />;
}
