import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getDiscussions, getDiscussionsCount } from '@/lib/db/queries/discussions';
import { DISCUSSION_CATEGORIES } from '@/lib/discussion-categories';
import DiscussionsClient from '../../discussions-client';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = DISCUSSION_CATEGORIES.find(c => c.slug === slug);
  if (!cat) return { title: 'Discussions' };
  return {
    title: `${cat.name} Discussions — OnNepal`,
    description: `Join ${cat.name} discussions on OnNepal community forum.`,
  };
}

export default async function DiscussionCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = DISCUSSION_CATEGORIES.find(c => c.slug === slug);
  const categoryName = cat?.name || '';

  let initialData = { items: [] as any[], total: 0 };
  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    const [items, total] = await Promise.all([
      getDiscussions(db, { category: categoryName, page: 1, limit: 20 }),
      getDiscussionsCount(db, { category: categoryName }),
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
    console.error('Discussions category SSR error:', e);
  }

  return <DiscussionsClient initialData={initialData} initialCategory={slug} />;
}
