import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getEvents, getEventsCount } from '@/lib/db/queries/events';
import { EVENT_CATEGORIES } from '@/lib/event-categories';
import EventsClient from '../../events-client';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = EVENT_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return { title: 'Events in Nepal' };
  return {
    title: `${cat.name} Events in Nepal`,
    description: `Discover ${cat.name} events happening in Nepal.`,
    openGraph: { title: `${cat.name} Events in Nepal`, description: `Discover ${cat.name} events in Nepal.` },
  };
}

export default async function EventCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = EVENT_CATEGORIES.find(c => c.slug === slug);
  const categoryName = cat?.name || '';

  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getEvents(db, { category: categoryName, page: 1, limit: 12 }),
      getEventsCount(db, { category: categoryName }),
    ]);
    initialData = {
      items: items.map(i => ({ ...i, createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt) })),
      total,
    };
  } catch (e) {
    console.error('Events category SSR error:', e);
  }

  return <EventsClient initialData={initialData} initialCategory={slug} />;
}
