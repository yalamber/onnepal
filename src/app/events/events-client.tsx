'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Calendar, Clock, Loader2 } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/lib/event-categories';
import { firstImageUrl } from '@/lib/image-utils';
import { SearchInput } from '@/components/search-input';
import { Pagination } from '@/components/pagination';
import { EmptyState } from '@/components/empty-state';
import { CategorySidebar, CategoryMobilePills } from '@/components/category-nav';
import { CitySelector } from '@/components/city-selector';

interface Event {
  id: string;
  title: string;
  description: string | null;
  category: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  venue: string | null;
  location: string | null;
  ticketPrice: string | null;
  imageUrls: string | null;
  status: string;
  createdAt: string;
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export interface EventsInitialData {
  items: Event[];
  total: number;
}

export default function EventsClient({ initialData }: { initialData: EventsInitialData }) {
  const [items, setItems] = useState<Event[]>(initialData.items);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialData.total / 12));
  const [total, setTotal] = useState(initialData.total);

  // CategorySidebar/MobilePills use slug, but API expects category name
  const categoryNameFromSlug = (slug: string) => EVENT_CATEGORIES.find(c => c.slug === slug)?.name || '';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const catName = categoryNameFromSlug(category);
      if (catName) params.set('category', catName);
      if (city) params.set('city', city);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '12');
      const res = await fetch(`/api/events?${params}`);
      if (res.ok) {
        const data = await res.json() as { items: Event[]; total: number; totalPages: number };
        setItems(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {} finally { setLoading(false); }
  }, [category, city, search, page]);

  useEffect(() => { if (category || city || search || page > 1 || initialData.items.length === 0) fetchItems(); }, []);
  useEffect(() => { const t = setTimeout(() => { if (search) { setPage(1); fetchItems(); } }, 350); return () => clearTimeout(t); }, [search]);

  const handleCategorySelect = (slug: string) => {
    setCategory(slug);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Events</h1>
            <p className="text-sm text-gray-500 mt-0.5">Discover events happening in Nepal</p>
          </div>
          <Link href="/events/post/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Post event
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search events..." />
          </div>
          <div className="w-full sm:w-48">
            <CitySelector value={city} onChange={(v) => { setCity(v); setPage(1); }} />
          </div>
        </div>

        <div className="mb-6">
          <CategoryMobilePills categories={EVENT_CATEGORIES} activeCategory={category} onSelect={handleCategorySelect} allLabel="All" />
        </div>

        <div className="flex gap-10">
          <aside className="w-48 flex-shrink-0">
            <CategorySidebar categories={EVENT_CATEGORIES} activeCategory={category} onSelect={handleCategorySelect} allLabel="All events" />
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <EmptyState icon={Calendar} title="No events found" subtitle="Be the first to post an event" />
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{total} {total === 1 ? 'event' : 'events'}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => {
                const thumb = firstImageUrl(item.imageUrls);
                return (
                  <Link key={item.id} href={`/events/${item.id}`}
                    className="border border-gray-100 rounded-lg overflow-hidden hover:border-gray-200 transition-colors group">
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-40 object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-28 bg-gray-50 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-200" />
                      </div>
                    )}
                    <div className="p-3.5">
                      <div className="flex items-center gap-2 mb-1.5 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(item.startDate)}</span>
                        {item.startTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.startTime}</span>}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-950 group-hover:text-gray-700 line-clamp-2">{item.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {item.venue && <span className="truncate">{item.venue}</span>}
                        {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>}
                      </div>
                      {item.ticketPrice && <p className="mt-2 text-xs font-medium text-gray-950">{item.ticketPrice}</p>}
                    </div>
                  </Link>
                );
              })}
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
