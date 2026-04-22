'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Loader2, ChevronLeft, ChevronRight, Package, ArrowLeft, MapPin, Plus,
} from 'lucide-react';
import { getClassifiedCategoryBySlug, CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';

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

function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

function getFirstImage(imageUrls: string | null): string | null {
  if (!imageUrls) return null;
  try { const arr = JSON.parse(imageUrls); return arr[0] || null; } catch { return null; }
}

const ITEMS_PER_PAGE = 12;

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
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchListings = useCallback(
    async (currentPage: number, currentSearch: string) => {
      if (!category) return;
      setLoading(true);
      const p = new URLSearchParams();
      p.set('page', String(currentPage));
      p.set('limit', String(ITEMS_PER_PAGE));
      p.set('category', category.name);
      if (currentSearch) p.set('search', currentSearch);

      try {
        const res = await fetch(`/api/classifieds?${p.toString()}`);
        const data = await res.json() as { listings: Listing[]; total: number; totalPages: number };
        setListings(data.listings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch { setListings([]); }
      finally { setLoading(false); setInitialLoad(false); }
    },
    [category]
  );

  useEffect(() => { if (category) fetchListings(1, ''); }, [category, fetchListings]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => { setPage(1); fetchListings(1, value); }, 350);
  };

  const goToPage = (p: number) => {
    setPage(p);
    fetchListings(p, search);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Package className="h-12 w-12 text-gray-300 mb-4" />
        <h1 className="text-lg font-bold text-gray-900 mb-2">Category not found</h1>
        <Link href="/classifieds" className="text-sm text-indigo-600 font-medium flex items-center gap-1 mt-4">
          <ArrowLeft className="h-4 w-4" /> Back to classifieds
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link href="/classifieds" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> All classifieds
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{category.name}</h1>
              <p className="text-gray-500 mt-1">{total} {total === 1 ? 'listing' : 'listings'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={`Search in ${category.name}...`}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all"
              />
            </div>
            <Link href="/classifieds/post/new" className="flex items-center gap-1.5 h-12 px-5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors flex-shrink-0">
              <Plus className="h-4 w-4" /> Post Ad
            </Link>
          </div>
        </div>
      </section>

      {/* Other categories */}
      <section className="bg-gray-50/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {CLASSIFIED_CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
              <Link key={c.slug} href={`/classifieds/${c.slug}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-500 hover:border-indigo-200 hover:text-indigo-600 transition-colors whitespace-nowrap flex-shrink-0">
                <span>{c.icon}</span> {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={gridRef}>
        {initialLoad ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-32 bg-gray-100 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search ? 'No results found' : 'No listings yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {search ? `No listings match "${search}".` : `Be the first to post in ${category.name}.`}
            </p>
            <Link href="/classifieds/post/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Post Free Ad
            </Link>
          </div>
        ) : (
          <>
            <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ${loading && !initialLoad ? 'opacity-60' : ''} transition-opacity`}>
              {listings.map((listing) => {
                const img = getFirstImage(listing.imageUrls);
                return (
                  <Link key={listing.id} href={`/classifieds/post/${listing.id}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    {img ? (
                      <img src={img} alt={listing.title} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-200" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{listing.title}</h3>
                      {listing.price && <p className="text-base font-bold text-emerald-600 mt-1">{listing.price}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {listing.location && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {listing.location}</span>
                        )}
                        <span>{timeAgo(listing.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
