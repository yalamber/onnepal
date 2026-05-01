import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getServices, getServicesCount } from '@/lib/db/queries/services';
import { SERVICE_CATEGORIES } from '@/lib/service-categories';
import ServicesClient from '../../services-client';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = SERVICE_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return { title: 'Pros Nepal' };
  return {
    title: `${cat.name} Local Pros in Nepal`,
    description: `Find ${cat.name} professionals in Nepal.`,
  };
}

export default async function ServicesCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = SERVICE_CATEGORIES.find(c => c.slug === slug);
  const categoryName = cat?.name || '';

  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getServices(db, { category: categoryName, page: 1, limit: 12 }),
      getServicesCount(db, { category: categoryName }),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('Pros category SSR error:', e);
  }

  return <ServicesClient initialData={initialData} initialCategory={slug} />;
}
