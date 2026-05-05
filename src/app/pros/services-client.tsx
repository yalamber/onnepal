'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Wrench, Loader2, MapPin } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/service-categories';
import { timeAgo } from '@/lib/time-ago';
import { SearchInput } from '@/components/search-input';
import { Pagination } from '@/components/pagination';
import { EmptyState } from '@/components/empty-state';
import { CityScopeBanner } from '@/components/city-scope-banner';
import { CategorySidebar, CategoryMobilePills } from '@/components/category-nav';

interface Service {
  id: string; title: string; description: string | null; category: string;
  location: string | null; priceType: string | null; price: string | null;
  imageUrls: string | null; createdAt: string; userName: string | null;
}

export interface ServicesInitialData { items: Service[]; total: number; }

export default function ServicesClient({ initialData, initialCategory }: { initialData: ServicesInitialData; initialCategory?: string }) {
  const [items, setItems] = useState<Service[]>(initialData.items);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const categorySlug = initialCategory || '';
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialData.total / 12));
  const [total, setTotal] = useState(initialData.total);

  useEffect(() => {
    setItems(initialData.items);
    setTotal(initialData.total);
    setTotalPages(Math.ceil(initialData.total / 12));
    setPage(1);
  }, [initialCategory]);

  const categoryNameFromSlug = (slug: string) => SERVICE_CATEGORIES.find(c => c.slug === slug)?.name || '';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const catName = categoryNameFromSlug(categorySlug);
      if (catName) params.set('category', catName);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '12');
      const res = await fetch(`/api/services?${params}`);
      if (res.ok) {
        const data = await res.json() as { items: Service[]; total: number; totalPages: number };
        setItems(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {} finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchItems(); }, [page]);
  useEffect(() => { const t = setTimeout(() => { if (search) { setPage(1); fetchItems(); } }, 350); return () => clearTimeout(t); }, [search]);

  const formatPrice = (item: Service) => {
    if (!item.price) return null;
    if (item.priceType === 'hourly') return `Rs. ${item.price}/hr`;
    if (item.priceType === 'free') return 'Free';
    return `Rs. ${item.price}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-hero-title">Local <em>pros</em></h1>
            <p className="text-sm text-gray-500 mt-0.5">Find trusted local service providers</p>
          </div>
          <Link href="/pros/post/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-md hover:bg-teal-800 transition-colors">
            <Plus className="h-4 w-4" /> List your service
          </Link>
        </div>

        <CityScopeBanner />
        <div className="mb-6">
          <SearchInput value={search} onChange={setSearch} placeholder="Search services..." />
        </div>

        <div className="mb-6">
          <CategoryMobilePills categories={SERVICE_CATEGORIES} activeCategory={categorySlug} basePath="/pros" allLabel="All" />
        </div>

        <div className="flex lg:gap-10">
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <CategorySidebar categories={SERVICE_CATEGORIES} activeCategory={categorySlug} basePath="/pros" allLabel="All pros" />
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
            ) : items.length === 0 ? (
              <EmptyState icon={Wrench} title="No pros yet" subtitle="Be the first to list your service" />
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-3">{total} {total === 1 ? 'pro' : 'pros'}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {items.map((item) => (
                    <Link key={item.id} href={`/pros/${item.id}`}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors group">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-950 group-hover:text-gray-700 line-clamp-2">{item.title}</h3>
                        {formatPrice(item) && (
                          <span className="text-sm font-semibold text-gray-950 flex-shrink-0">{formatPrice(item)}</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-medium text-gray-600">{item.category}</span>
                        {item.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{item.location}</span>}
                        <span>{timeAgo(item.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-8">
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
