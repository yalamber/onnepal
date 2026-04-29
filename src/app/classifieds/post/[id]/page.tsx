import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getClassifiedById } from '@/lib/db/queries/classifieds';
import ClassifiedDetail from './classified-detail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb(getD1Database());
    const item = await getClassifiedById(db, id);
    if (!item) return { title: 'Not Found' };
    const img = item.imageUrls ? (() => { try { const a = JSON.parse(item.imageUrls as string) as string[]; return a[0] ? `https://images.onnepal.com/${a[0]}` : undefined; } catch { return undefined; } })() : undefined;
    return {
      title: item.title,
      description: item.description?.slice(0, 160) || `${item.title} — classified ad on OnNepal`,
      openGraph: {
        title: item.title,
        description: item.description?.slice(0, 160) || `${item.title} on OnNepal`,
        type: 'website',
        ...(img && { images: [{ url: img }] }),
      },
    };
  } catch { return { title: 'Classified Ad' }; }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;
  try {
    const db = getDb(getD1Database());
    const item = await getClassifiedById(db, id);
    if (item) {
      initialData = { ...item, createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt) };
    }
  } catch {}

  const jsonLd = initialData ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: initialData.title,
    description: initialData.description || undefined,
    ...(initialData.price && { offers: { '@type': 'Offer', price: initialData.price, priceCurrency: 'NPR', availability: initialData.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut' } }),
    ...(initialData.imageUrls && (() => { try { const a = JSON.parse(initialData.imageUrls as string) as string[]; return a[0] ? { image: `https://images.onnepal.com/${a[0]}` } : {}; } catch { return {}; } })()),
  } : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ClassifiedDetail initialData={initialData} />
    </>
  );
}
