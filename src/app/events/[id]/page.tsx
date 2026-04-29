import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getEventById } from '@/lib/db/queries/events';
import EventDetail from './event-detail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb(getD1Database());
    const item = await getEventById(db, id);
    if (!item) return { title: 'Not Found' };
    const img = item.imageUrls ? (() => { try { const a = JSON.parse(item.imageUrls as string) as string[]; return a[0] ? `https://images.onnepal.com/${a[0]}` : undefined; } catch { return undefined; } })() : undefined;
    return {
      title: item.title,
      description: item.description?.slice(0, 160) || `${item.title} — event on OnNepal`,
      openGraph: {
        title: item.title,
        description: item.description?.slice(0, 160) || `${item.title} on OnNepal`,
        type: 'website',
        ...(img && { images: [{ url: img }] }),
      },
    };
  } catch { return { title: 'Event' }; }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;
  try {
    const db = getDb(getD1Database());
    const item = await getEventById(db, id);
    if (item) {
      initialData = { ...item, createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt) };
    }
  } catch {}

  const jsonLd = initialData ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: initialData.title,
    description: initialData.description || undefined,
    startDate: initialData.startDate,
    ...(initialData.endDate && { endDate: initialData.endDate }),
    ...(initialData.venue && { location: { '@type': 'Place', name: initialData.venue, ...(initialData.location && { address: initialData.location }) } }),
    ...(initialData.ticketPrice && { offers: { '@type': 'Offer', price: initialData.ticketPrice, priceCurrency: 'NPR', ...(initialData.ticketUrl && { url: initialData.ticketUrl }) } }),
    ...(initialData.imageUrls && (() => { try { const a = JSON.parse(initialData.imageUrls as string) as string[]; return a[0] ? { image: `https://images.onnepal.com/${a[0]}` } : {}; } catch { return {}; } })()),
    eventStatus: initialData.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
  } : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <EventDetail initialData={initialData} />
    </>
  );
}
