import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getLostFoundItems, getLostFoundCount } from '@/lib/db/queries/lost-found';
import { LOST_FOUND_CATEGORIES } from '@/lib/lost-found-categories';
import LostFoundClient from '../../lost-found-client';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = LOST_FOUND_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return { title: 'Lost & Found Nepal' };
  return {
    title: `Lost & Found ${cat.name} in Nepal`,
    description: `Browse lost and found ${cat.name} in Nepal. Help reunite items with their owners.`,
    openGraph: { title: `Lost & Found ${cat.name} in Nepal`, description: `Lost and found ${cat.name} in Nepal.` },
  };
}

export default async function LostFoundCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = LOST_FOUND_CATEGORIES.find(c => c.slug === slug);
  // The lost-found API filters by category name, not slug
  const categoryName = cat?.name || '';

  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getLostFoundItems(db, { category: categoryName, page: 1, limit: 12 }),
      getLostFoundCount(db, { category: categoryName }),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('LostFound category SSR error:', e);
  }

  return <LostFoundClient initialData={initialData} initialCategory={slug} />;
}
