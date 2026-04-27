'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, MapPin, Calendar, Clock, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/lib/event-categories';
import { imageUrl } from '@/components/image-upload';

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialData.total / 12));
  const [total, setTotal] = useState(initialData.total);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
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
  }, [category, search, page]);

  useEffect(() => { if (category || search || page > 1) fetchItems(); }, [fetchItems]);
  useEffect(() => { const t = setTimeout(() => { if (search) { setPage(1); fetchItems(); } }, 350); return () => clearTimeout(t); }, [search]);

  const firstImage = (item: Event) => {
    if (!item.imageUrls) return null;
    try { const arr = JSON.parse(item.imageUrls) as string[]; return arr[0] ? imageUrl(arr[0]) : null; } catch { return null; }
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors" />
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-6 pb-1">
          <button onClick={() => { setCategory(''); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-md font-medium cursor-pointer transition-colors ${!category ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            All
          </button>
          {EVENT_CATEGORIES.map((c) => (
            <button key={c.slug} onClick={() => { setCategory(c.name); setPage(1); }}
              className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-md font-medium cursor-pointer transition-colors ${category === c.name ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-lg">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">No events found</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to post an event</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{total} {total === 1 ? 'event' : 'events'}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => {
                const thumb = firstImage(item);
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
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-md border border-gray-200 text-gray-400 hover:text-gray-950 disabled:opacity-30 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-md border border-gray-200 text-gray-400 hover:text-gray-950 disabled:opacity-30 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
