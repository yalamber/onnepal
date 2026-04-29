import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getLostFoundById } from '@/lib/db/queries/lost-found';
import LostFoundDetail from './lost-found-detail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb(getD1Database());
    const item = await getLostFoundById(db, id);
    if (!item) return { title: 'Not Found' };
    const img = item.imageUrls ? (() => { try { const a = JSON.parse(item.imageUrls as string) as string[]; return a[0] ? `https://images.onnepal.com/${a[0]}` : undefined; } catch { return undefined; } })() : undefined;
    return {
      title: `${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title}`,
      description: item.description?.slice(0, 160) || `${item.title} — ${item.type} item on OnNepal`,
      openGraph: {
        title: `${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title}`,
        description: item.description?.slice(0, 160) || `${item.title} on OnNepal`,
        type: 'website',
        ...(img && { images: [{ url: img }] }),
      },
    };
  } catch { return { title: 'Lost & Found' }; }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;
  try {
    const db = getDb(getD1Database());
    const item = await getLostFoundById(db, id);
    if (item) {
      initialData = { ...item, createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt) };
    }
  } catch {}

  return <LostFoundDetail initialData={initialData} />;
}
