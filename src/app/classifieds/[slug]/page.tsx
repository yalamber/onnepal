'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { getClassifiedCategoryBySlug, CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';

interface Listing {
  id: string;
  title: string;
  price: string | null;
  category: string;
  location: string | null;
  imageUrls: string | null;
  createdAt: string;
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

export default function ClassifiedCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = getClassifiedCategoryBySlug(slug);

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchListings = useCallback(async (p: number, s: string) => {
    if (!category) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(p)); params.set('limit', String(PER_PAGE));
    params.set('category', category.name);
    if (s) params.set('search', s);
    try {
      const res = await fetch(`/api/classifieds?${params}`);
      const data = await res.json() as { listings: Listing[]; total: number; totalPages: number };
      setListings(data.listings); setTotal(data.total); setTotalPages(data.totalPages);
    } catch { setListings([]); }
    finally { setLoading(false); setInitialLoad(false); }
  }, [category]);

  useEffect(() => { if (category) fetchListings(1, ''); }, [category, fetchListings]);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => { setPage(1); fetchListings(1, v); }, 350);
  };

  const goToPage = (p: number) => { setPage(p); fetchListings(p, search); };

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-sm text-gray-400 mb-4">Category not found.</p>
        <Link href="/classifieds" className="text-sm text-gray-950 font-medium hover:underline">&larr; Back</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/classifieds" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">&larr; All classifieds</Link>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">{category.name}</h1>
                <p className="text-gray-400 text-sm">{total} {total === 1 ? 'listing' : 'listings'}</p>
              </div>
            </div>
            <Link href="/classifieds/post/new" className="hidden sm:block px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Post ad
            </Link>
          </div>

          <div className="mt-6 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input
              type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
              placeholder={`Search in ${category.name}...`}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Other categories */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {CLASSIFIED_CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
            <Link key={c.slug} href={`/classifieds/${c.slug}`} className="flex-shrink-0 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-950 transition-colors whitespace-nowrap">
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100 max-w-5xl mx-auto" />

      {/* Results */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {initialLoad ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm text-gray-400 mb-4">{search ? `No results for "${search}".` : `No listings in ${category.name} yet.`}</p>
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
                        {listing.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>}
                        <span>{timeAgo(listing.createdAt)}</span>
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
      </section>
    </main>
  );
}
