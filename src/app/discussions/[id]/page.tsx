import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getDiscussionById, getReplies } from '@/lib/db/queries/discussions';
import DiscussionDetail from './discussion-detail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb(getD1Database());
    const item = await getDiscussionById(db, id);
    if (!item) return { title: 'Not Found' };
    return {
      title: `${item.title} — Discussion on OnNepal`,
      description: item.content?.slice(0, 160) || `${item.title} — discussion on OnNepal community`,
      openGraph: {
        title: item.title,
        description: item.content?.slice(0, 160) || `${item.title} on OnNepal`,
        type: 'website',
      },
    };
  } catch { return { title: 'Discussion' }; }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;
  let initialReplies: any[] = [];

  try {
    const db = getDb(getD1Database());
    const [item, replies] = await Promise.all([
      getDiscussionById(db, id),
      getReplies(db, id),
    ]);
    if (item) {
      initialData = {
        ...item,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
        lastActivityAt: item.lastActivityAt instanceof Date ? item.lastActivityAt.toISOString() : String(item.lastActivityAt),
      };
      initialReplies = replies.map(r => ({
        ...r,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      }));
    }
  } catch {}

  return <DiscussionDetail initialData={initialData} initialReplies={initialReplies} />;
}
