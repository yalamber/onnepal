import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getPlaces, getPlacesCount } from '@/lib/db/queries/places';
import { PLACE_CATEGORIES } from '@/lib/place-categories';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumbs';
import PlacesClient from '../../places-client';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = PLACE_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return { title: 'Places in Nepal' };
  return {
    title: `${cat.name} in Nepal — Discover Hidden Gems`,
    description: `Explore ${cat.name} across Nepal. Find directions, photos, and tips.`,
    openGraph: { title: `${cat.name} in Nepal`, description: `Explore ${cat.name} across Nepal.` },
  };
}

export default async function PlaceCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = PLACE_CATEGORIES.find(c => c.slug === slug);
  const categoryName = cat?.name || '';

  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getPlaces(db, { category: categoryName, page: 1, limit: 12 }),
      getPlacesCount(db, { category: categoryName }),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('Places category SSR error:', e);
  }

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: 'Home', url: 'https://onnepal.com' },
    { name: 'Places', url: 'https://onnepal.com/places' },
    { name: cat?.name || slug, url: `https://onnepal.com/places/category/${slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <PlacesClient initialData={initialData} initialCategory={slug} />
    </>
  );
}
