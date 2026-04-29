import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getPlaceById } from '@/lib/db/queries/places';
import PlaceDetail from './place-detail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb(getD1Database());
    const item = await getPlaceById(db, id);
    if (!item) return { title: 'Not Found' };
    const img = item.imageUrls ? (() => { try { const a = JSON.parse(item.imageUrls as string) as string[]; return a[0] ? `https://images.onnepal.com/${a[0]}` : undefined; } catch { return undefined; } })() : undefined;
    return {
      title: item.title,
      description: item.description?.slice(0, 160) || `${item.title} — a place to discover on OnNepal`,
      openGraph: {
        title: item.title,
        description: item.description?.slice(0, 160) || `${item.title} on OnNepal`,
        type: 'website',
        ...(img && { images: [{ url: img }] }),
      },
    };
  } catch { return { title: 'Place' }; }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;
  try {
    const db = getDb(getD1Database());
    const item = await getPlaceById(db, id);
    if (item) {
      initialData = { ...item, createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt) };
    }
  } catch {}

  const jsonLd = initialData ? {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: initialData.title,
    description: initialData.description || undefined,
    ...(initialData.location && { address: { '@type': 'PostalAddress', addressLocality: initialData.location, addressCountry: 'NP' } }),
    ...(initialData.imageUrls && (() => { try { const a = JSON.parse(initialData.imageUrls as string) as string[]; return a[0] ? { image: `https://images.onnepal.com/${a[0]}` } : {}; } catch { return {}; } })()),
    ...(initialData.website && { url: initialData.website }),
  } : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <PlaceDetail initialData={initialData} />
    </>
  );
}
