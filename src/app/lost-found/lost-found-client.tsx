'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Clock, Loader2, AlertTriangle, Eye } from 'lucide-react';
import { LOST_FOUND_CATEGORIES } from '@/lib/lost-found-categories';
import { timeAgo } from '@/lib/time-ago';
import { firstImageUrl } from '@/lib/image-utils';
import { SearchInput } from '@/components/search-input';
import { Pagination } from '@/components/pagination';
import { EmptyState } from '@/components/empty-state';
import { CategorySidebar, CategoryMobilePills } from '@/components/category-nav';

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

export interface LostFoundInitialData {
  items: Item[];
  total: number;
}

// CategorySidebar/MobilePills expect slug-based identity; the API filters by name,
// so we use name as the slug value for seamless interop.
const categoryNavItems = LOST_FOUND_CATEGORIES.map((c) => ({ name: c.name, slug: c.name }));

export default function LostFoundClient({ initialData }: { initialData: LostFoundInitialData }) {
  const [items, setItems] = useState<Item[]>(initialData.items);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialData.total / 12));
  const [total, setTotal] = useState(initialData.total);

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

  useEffect(() => { if (type || category || search || page > 1 || initialData.items.length === 0) fetchItems(); }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (search) { setPage(1); fetchItems(); } }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setPage(1);
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
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search lost & found items..." />
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

        {/* Category pills — mobile only */}
        <div className="mb-6">
          <CategoryMobilePills
            categories={categoryNavItems}
            activeCategory={category}
            onSelect={handleCategorySelect}
            allLabel="All"
          />
        </div>

        <div className="flex gap-10">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <CategorySidebar
              categories={categoryNavItems}
              activeCategory={category}
              onSelect={handleCategorySelect}
              allLabel="All items"
            />
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No items found"
            subtitle="Try adjusting your filters or post a new item"
          />
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{total} {total === 1 ? 'item' : 'items'}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => {
                const thumb = firstImageUrl(item.imageUrls);
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
            <div className="mt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
