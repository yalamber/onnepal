'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';
import { timeAgo } from '@/lib/time-ago';
import { firstImageUrl } from '@/lib/image-utils';
import { SearchInput } from '@/components/search-input';
import { Pagination } from '@/components/pagination';
import { EmptyState } from '@/components/empty-state';
import { Search } from 'lucide-react';
import { CitySelector } from '@/components/city-selector';

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

const PER_PAGE = 12;

export interface ClassifiedsInitialData {
  listings: Listing[];
  total: number;
  categories: Array<{ category: string; count: number }>;
}

export default function ClassifiedsClient({ initialData }: { initialData: ClassifiedsInitialData }) {
  const [listings, setListings] = useState<Listing[]>(initialData.listings);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialData.total / PER_PAGE));
  const [categories, setCategories] = useState<{ category: string; count: number }[]>(initialData.categories);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const fetchListings = useCallback(async (p: number, s: string, c: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', String(PER_PAGE));
    if (s) params.set('search', s);
    if (c) params.set('category', c);
    if (city) params.set('city', city);
    try {
      const res = await fetch(`/api/classifieds?${params}`);
      const data = await res.json() as APIResponse;
      setListings(data.listings); setTotal(data.total);
      setTotalPages(data.totalPages); setCategories(data.categories);
    } catch {} finally { setLoading(false); setInitialLoad(false); }
  }, [city]);

  const cityMounted = useRef(false);
  useEffect(() => { if (cityMounted.current) { fetchListings(1, activeSearch, activeCategory); } else { cityMounted.current = true; } }, [city]);

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput); setPage(1);
    fetchListings(1, searchInput, activeCategory);
  };

  const handleCategory = (c: string) => {
    const next = c === activeCategory ? '' : c;
    setActiveCategory(next); setPage(1);
    fetchListings(1, activeSearch, next);
  };

  const goToPage = (p: number) => { setPage(p); fetchListings(p, activeSearch, activeCategory); };

  const catCounts = new Map(categories.map((c) => [c.category, c.count]));

  const toggleGroup = (slug: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="pt-12 sm:pt-16 pb-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 tracking-tight">Classifieds</h1>
              <p className="mt-2 text-gray-400">Buy, sell, and find services across Nepal.</p>
            </div>
            <Link href="/classifieds/post/new" className="hidden sm:block px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors">
              Post ad
            </Link>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-lg">
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <SearchInput value={searchInput} onChange={handleSearch} placeholder="Search classifieds..." />
            </form>
            <div className="w-full sm:w-48">
              <CitySelector value={city} onChange={(v) => { setCity(v); setPage(1); }} />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-px bg-gray-100" /></div>

      {/* Sidebar + Content */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-10">
            {/* Sidebar — classifieds has subcategories so we keep custom UI */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <nav>
                <Link href="/classifieds"
                  className={`block px-2 py-1.5 rounded text-sm cursor-pointer transition-colors mb-2 ${
                    !activeCategory ? 'bg-gray-100 text-gray-950 font-medium' : 'text-gray-500 hover:text-gray-950'
                  }`}>
                  All classifieds
                </Link>
                {CLASSIFIED_CATEGORIES.map((parent) => {
                  const isExpanded = expandedGroups.has(parent.slug);
                  const parentCount = parent.subcategories.reduce((sum, s) => sum + (catCounts.get(s.name) || 0), 0);
                  return (
                    <div key={parent.slug} className="mt-1">
                      <button onClick={() => toggleGroup(parent.slug)}
                        className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded text-sm cursor-pointer transition-colors text-gray-950 hover:bg-gray-50">
                        <span className="font-medium">{parent.name}</span>
                        <span className="flex items-center gap-1">
                          {parentCount > 0 && <span className="text-xs text-gray-300">{parentCount}</span>}
                          <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="ml-2 mt-0.5 space-y-0.5">
                          <Link href={`/classifieds/${parent.slug}`}
                            className="block px-2 py-1 rounded text-xs cursor-pointer text-gray-400 hover:text-gray-950 transition-colors">
                            All {parent.name}
                          </Link>
                          {parent.subcategories.map((sub) => {
                            const count = catCounts.get(sub.name) || 0;
                            return (
                              <Link key={sub.slug} href={`/classifieds/${sub.slug}`}
                                className="flex items-center justify-between px-2 py-1 rounded text-sm cursor-pointer transition-colors text-gray-500 hover:text-gray-950">
                                <span className="truncate">{sub.name}</span>
                                {count > 0 && <span className="text-xs text-gray-300">{count}</span>}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link href="/classifieds/post/new" className="text-sm text-gray-400 hover:text-gray-950 cursor-pointer transition-colors">
                  Post a free ad &rarr;
                </Link>
              </div>
            </aside>

            {/* Mobile category bar — classifieds has subcategories so we keep custom UI */}
            <div className="lg:hidden w-full mb-4 -mt-2 flex flex-col gap-3">
              <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
                <Link href="/classifieds"
                  className={`flex-shrink-0 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${!activeCategory ? 'bg-cyan-600 text-white' : 'text-gray-500'}`}>
                  All
                </Link>
                {CLASSIFIED_CATEGORIES.flatMap((p) => p.subcategories).map((sub) => (
                  <Link key={sub.slug} href={`/classifieds/${sub.slug}`}
                    className={`flex-shrink-0 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors whitespace-nowrap ${activeCategory === sub.name ? 'bg-cyan-600 text-white' : 'text-gray-500'}`}>
                    {sub.name}
                  </Link>
                ))}
              </div>
              <Link href="/classifieds/post/new" className="sm:hidden text-sm text-gray-950 font-medium">Post ad &rarr;</Link>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {(loading || total > 0) && (
                <div className="flex items-baseline justify-between mb-5">
                  <p className="text-sm text-gray-400">
                    {loading ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching...</span>
                    ) : (
                      <>
                        <span className="text-gray-950 font-medium">{total}</span> {total === 1 ? 'listing' : 'listings'}
                        {activeCategory && <> in {activeCategory}</>}
                        {activeSearch && <> matching &ldquo;{activeSearch}&rdquo;</>}
                      </>
                    )}
                  </p>
                </div>
              )}

              {initialLoad ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />)}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-8">
                  <EmptyState
                    icon={Search}
                    title={activeSearch || activeCategory ? 'No listings match your filters.' : 'No listings yet.'}
                    subtitle="Post a free ad to get started"
                  />
                  <Link href="/classifieds/post/new" className="text-sm text-gray-950 font-medium hover:underline mt-4 inline-block">Post a free ad &rarr;</Link>
                </div>
              ) : (
                <>
                  <div className={`divide-y divide-gray-100 ${loading && !initialLoad ? 'opacity-40' : ''} transition-opacity`}>
                    {listings.map((listing) => {
                      const img = firstImageUrl(listing.imageUrls);
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
                              <span>{listing.category}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-10">
                    <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
