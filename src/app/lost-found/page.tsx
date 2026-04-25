'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, MapPin, Clock, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Eye } from 'lucide-react';
import { LOST_FOUND_CATEGORIES } from '@/lib/lost-found-categories';
import { imageUrl } from '@/components/image-upload';

interface Item {
  id: string;
  type: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  itemDate: string | null;
  reward: string | null;
  imageUrls: string | null;
  createdAt: string;
  userName: string | null;
}

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

export default function LostFoundPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await fetch(`/api/lost-found?${params}`);
      if (res.ok) {
        const data = await res.json() as { items: Item[]; total: number; totalPages: number };
        setItems(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {} finally { setLoading(false); }
  }, [type, category, search, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchItems(); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const firstImage = (item: Item) => {
    if (!item.imageUrls) return null;
    try { const arr = JSON.parse(item.imageUrls) as string[]; return arr[0] ? imageUrl(arr[0]) : null; } catch { return null; }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Lost & Found</h1>
            <p className="text-sm text-gray-500 mt-0.5">Help reunite lost items with their owners</p>
          </div>
          <Link href="/lost-found/post/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Post item
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lost & found items..."
              className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {['', 'lost', 'found'].map((t) => (
              <button key={t} onClick={() => { setType(t); setPage(1); }}
                className={`px-3 py-2 text-sm rounded-md font-medium transition-colors cursor-pointer ${
                  type === t ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {t === '' ? 'All' : t === 'lost' ? 'Lost' : 'Found'}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-6 pb-1">
          <button onClick={() => { setCategory(''); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              !category ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            All categories
          </button>
          {LOST_FOUND_CATEGORIES.map((cat) => (
            <button key={cat.slug} onClick={() => { setCategory(cat.name); setPage(1); }}
              className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                category === cat.name ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-lg">
            <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">No items found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or post a new item</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{total} {total === 1 ? 'item' : 'items'}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => {
                const thumb = firstImage(item);
                return (
                  <Link key={item.id} href={`/lost-found/post/${item.id}`}
                    className="border border-gray-100 rounded-lg overflow-hidden hover:border-gray-200 transition-colors group">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-40 object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-28 bg-gray-50 flex items-center justify-center">
                        {item.type === 'lost' ? <AlertTriangle className="h-8 w-8 text-gray-200" /> : <Eye className="h-8 w-8 text-gray-200" />}
                      </div>
                    )}
                    <div className="p-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded ${
                          item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[11px] text-gray-400">{item.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-950 group-hover:text-gray-700 line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(item.createdAt)}</span>
                      </div>
                      {item.reward && <p className="mt-2 text-xs font-medium text-amber-600">Reward: {item.reward}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-md border border-gray-200 text-gray-400 hover:text-gray-950 disabled:opacity-30 cursor-pointer transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-md border border-gray-200 text-gray-400 hover:text-gray-950 disabled:opacity-30 cursor-pointer transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
