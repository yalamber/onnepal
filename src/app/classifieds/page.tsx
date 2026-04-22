'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { CLASSIFIED_CATEGORIES, getClassifiedSlugFromName } from '@/lib/classified-categories';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  category: string;
  location: string | null;
  imageUrls: string | null;
  createdAt: string;
  userName: string | null;
}

interface APIResponse {
  listings: Listing[];
  total: number;
  page: number;
  totalPages: number;
  categories: { category: string; count: number }[];
}

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d`;
  if (hrs > 0) return `${hrs}h`;
  if (mins > 0) return `${mins}m`;
  return 'now';
}

function firstImage(urls: string | null): string | null {
  if (!urls) return null;
  try { return (JSON.parse(urls) as string[])[0] || null; } catch { return null; }
}

const PER_PAGE = 12;

export default function ClassifiedsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchListings = useCallback(async (p: number, s: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', String(PER_PAGE));
    if (s) params.set('search', s);
    try {
      const res = await fetch(`/api/classifieds?${params}`);
      const data = await res.json() as APIResponse;
      setListings(data.listings); setTotal(data.total);
      setTotalPages(data.totalPages); setCategories(data.categories);
    } catch {} finally { setLoading(false); setInitialLoad(false); }
  }, []);

  useEffect(() => { fetchListings(1, ''); }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput); setPage(1);
    fetchListings(1, searchInput);
  };

  const goToPage = (p: number) => { setPage(p); fetchListings(p, activeSearch); };

  const catCounts = new Map(categories.map((c) => [c.category, c.count]));

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 tracking-tight">Classifieds</h1>
              <p className="mt-2 text-gray-400 text-lg">Buy, sell, and find services across Nepal.</p>
            </div>
            <Link href="/classifieds/post/new" className="hidden sm:block px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Post ad
            </Link>
          </div>

          <form onSubmit={handleSearch} className="mt-8 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input
              type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search classifieds..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </form>
        </div>
      </section>

      <div className="h-px bg-gray-100 max-w-5xl mx-auto" />

      {/* Categories */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-medium text-gray-950 mb-4">Browse by category</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
            {CLASSIFIED_CATEGORIES.map((cat) => {
              const count = catCounts.get(cat.name) || 0;
              return (
                <Link key={cat.slug} href={`/classifieds/${cat.slug}`} className="group flex items-baseline gap-3 py-0.5">
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-sm text-gray-600 group-hover:text-gray-950 transition-colors">{cat.name}</span>
                  {count > 0 && <span className="text-xs text-gray-300">{count}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-100 max-w-5xl mx-auto" />

      {/* Latest listings */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <p className="text-sm font-medium text-gray-950">
              {activeSearch ? <>Results for &ldquo;{activeSearch}&rdquo;</> : 'Latest listings'}
              {!loading && <span className="text-gray-300 font-normal ml-2">{total}</span>}
            </p>
            <Link href="/classifieds/post/new" className="sm:hidden text-sm text-gray-950 font-medium">Post ad &rarr;</Link>
          </div>

          {initialLoad ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-sm text-gray-400 mb-4">
                {activeSearch ? 'No listings match your search.' : 'No listings yet. Be the first to post.'}
              </p>
              <Link href="/classifieds/post/new" className="text-sm text-gray-950 font-medium hover:underline">Post a free ad &rarr;</Link>
            </div>
          ) : (
            <>
              <div className={`divide-y divide-gray-100 ${loading && !initialLoad ? 'opacity-40' : ''} transition-opacity`}>
                {listings.map((listing) => {
                  const img = firstImage(listing.imageUrls);
                  return (
                    <Link key={listing.id} href={`/classifieds/post/${listing.id}`} className="group flex gap-4 py-4 first:pt-0">
                      {img ? (
                        <img src={img} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0 bg-gray-50" />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-50 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0 py-0.5">
                        <p className="text-sm font-medium text-gray-950 group-hover:underline truncate">{listing.title}</p>
                        {listing.price && <p className="text-sm font-semibold text-gray-950 mt-1">{listing.price}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          {listing.location && (
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>
                          )}
                          <span>{timeAgo(listing.createdAt)}</span>
                          <span>{listing.category}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-10">
                  <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-950 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                  <span className="px-3 py-1.5 text-sm text-gray-400">Page <span className="text-gray-950 font-medium">{page}</span> of {totalPages}</span>
                  <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-950 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
