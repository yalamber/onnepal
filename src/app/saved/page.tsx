'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Loader2, MapPin, Calendar, Briefcase, ShoppingBag, HelpCircle, Compass } from 'lucide-react';
import { timeAgo } from '@/lib/time-ago';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { EmptyState } from '@/components/empty-state';
import { toast } from 'sonner';

interface BookmarkItem {
  id: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Bookmark; color: string; pathPrefix: string }> = {
  classified: { label: 'Classified', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', pathPrefix: '/classifieds/post/' },
  job: { label: 'Job', icon: Briefcase, color: 'bg-purple-50 text-purple-600', pathPrefix: '/jobs/' },
  event: { label: 'Event', icon: Calendar, color: 'bg-amber-50 text-amber-600', pathPrefix: '/events/' },
  'lost-found': { label: 'Lost & Found', icon: HelpCircle, color: 'bg-red-50 text-red-600', pathPrefix: '/lost-found/post/' },
  place: { label: 'Place', icon: Compass, color: 'bg-teal-50 text-teal-600', pathPrefix: '/places/' },
};

export default function SavedPage() {
  const { ready } = useRequireAuth();
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    fetchBookmarks();
  }, [ready]);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      if (!res.ok) return;
      const data = await res.json() as { bookmarks: BookmarkItem[] };
      const bmarks = data.bookmarks || [];

      const resolved = await Promise.all(
        bmarks.map(async (b) => {
          const config = TYPE_CONFIG[b.targetType];
          if (!config) return { ...b, href: '#', title: 'Unknown item' };
          try {
            const apiPath = b.targetType === 'classified' ? 'classifieds' : b.targetType === 'lost-found' ? 'lost-found' : b.targetType + 's';
            const r = await fetch(`/api/${apiPath}/${b.targetId}`);
            if (!r.ok) return { ...b, href: config.pathPrefix + b.targetId, title: 'Item not available' };
            const d = await r.json();
            const item = d.item || d.listing || d;
            return {
              ...b,
              href: config.pathPrefix + b.targetId,
              title: item.title || item.name || 'Untitled',
              subtitle: item.company || item.location || item.venue || item.category || undefined,
              createdAt: typeof b.createdAt === 'number' ? new Date(b.createdAt * 1000).toISOString() : b.createdAt,
            };
          } catch {
            return { ...b, href: config.pathPrefix + b.targetId, title: 'Item not available' };
          }
        })
      );

      setItems(resolved);
    } catch {} finally { setLoading(false); }
  };

  const removeBookmark = async (targetType: string, targetId: string) => {
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId }),
    });
    if (res.ok) {
      setItems(prev => prev.filter(i => !(i.targetType === targetType && i.targetId === targetId)));
      toast.success('Removed from saved');
    }
  };

  if (!ready || loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight mb-1">Saved items</h1>
        <p className="text-sm text-gray-500 mb-8">Your bookmarked listings</p>

        {items.length === 0 ? (
          <EmptyState icon={Bookmark} title="No saved items" subtitle="Bookmark listings to find them here later" />
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const config = TYPE_CONFIG[item.targetType];
              const Icon = config?.icon || Bookmark;
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-md hover:border-gray-200 transition-colors group">
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${config?.color || 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <Link href={item.href || '#'} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-950 truncate group-hover:text-gray-700">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-gray-400">{config?.label}</span>
                      {item.subtitle && <span className="text-[11px] text-gray-400 truncate">{item.subtitle}</span>}
                    </div>
                  </Link>
                  <button
                    onClick={() => removeBookmark(item.targetType, item.targetId)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                    title="Remove"
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
