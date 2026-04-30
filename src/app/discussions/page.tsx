import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getDiscussions, getDiscussionsCount } from '@/lib/db/queries/discussions';
import DiscussionsClient from './discussions-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discussions — Community Forum for Nepal',
  description: 'Join discussions about Nepal. Ask questions, share tips, and connect with the community.',
  openGraph: { title: 'Discussions — Nepal Community Forum', description: 'Join discussions about Nepal.' },
};

export default async function DiscussionsPage() {
  let initialData = { items: [] as any[], total: 0 };

  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getDiscussions(db, { page: 1, limit: 20 }),
      getDiscussionsCount(db, {}),
    ]);
    initialData = {
      items: items.map(i => ({
        ...i,
        createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt),
        lastActivityAt: i.lastActivityAt instanceof Date ? i.lastActivityAt.toISOString() : String(i.lastActivityAt),
      })),
      total,
    };
  } catch (e) {
    console.error('Discussions SSR error:', e);
  }

  return <DiscussionsClient initialData={initialData} />;
}
