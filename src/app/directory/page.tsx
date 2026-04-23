'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { BusinessCard, BusinessCardSkeleton } from '@/components/business-card';
import type { BusinessCardData } from '@/components/business-card';
import { CATEGORIES } from '@/lib/categories';

interface CategoryInfo { category: string; count: number; }
const ITEMS_PER_PAGE = 12;

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<BusinessCardData[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchBusinesses = useCallback(async (p: number, s: string, c: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', String(ITEMS_PER_PAGE));
    if (s) params.set('search', s);
    if (c) params.set('category', c);
    try {
      const res = await fetch(`/api/directory?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json() as { businesses: BusinessCardData[]; total: number; totalPages: number; categories: CategoryInfo[] };
      setBusinesses(data.businesses); setTotal(data.total); setTotalPages(data.totalPages); setCategories(data.categories);
    } catch {} finally { setLoading(false); setInitialLoad(false); }
  }, []);

  useEffect(() => { fetchBusinesses(1, '', ''); }, [fetchBusinesses]);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => { setPage(1); fetchBusinesses(1, v, activeCategory); }, 350);
  };

  const goToPage = (p: number) => {
    setPage(p);
    fetchBusinesses(p, search, activeCategory);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearFilters = () => {
    setSearch(''); setActiveCategory(''); setPage(1);
    fetchBusinesses(1, '', '');
    if (searchInputRef.current) searchInputRef.current.value = '';
  };

  const toggleGroup = (slug: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  const hasFilters = search || activeCategory;
  const catCounts = new Map(categories.map((c) => [c.category, c.count]));

  return (
    <main className="min-h-screen">
      <section className="pt-12 sm:pt-16 pb-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 tracking-tight">Business directory</h1>
          <p className="mt-2 text-gray-400">Find and connect with businesses across Nepal.</p>
          <div className="mt-6 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input ref={searchInputRef} type="text" placeholder="Search businesses..."
              defaultValue={search} onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-8 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors" />
            {search && (
              <button onClick={() => { handleSearch(''); if (searchInputRef.current) searchInputRef.current.value = ''; }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-px bg-gray-100" /></div>

      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-10">
            {/* Sidebar */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <nav>
                <Link href="/directory"
                  className={`block px-2 py-1.5 rounded text-sm cursor-pointer transition-colors mb-2 ${
                    !activeCategory ? 'bg-gray-100 text-gray-950 font-medium' : 'text-gray-500 hover:text-gray-950'
                  }`}>
                  All businesses
                </Link>
                {CATEGORIES.map((parent) => {
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
                          <Link href={`/directory/${parent.slug}`}
                            className="block px-2 py-1 rounded text-xs cursor-pointer text-gray-400 hover:text-gray-950 transition-colors">
                            All {parent.name}
                          </Link>
                          {parent.subcategories.map((sub) => {
                            const count = catCounts.get(sub.name) || 0;
                            return (
                              <Link key={sub.slug} href={`/directory/${sub.slug}`}
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
            </aside>

            {/* Mobile */}
            <div className="lg:hidden w-full mb-4 -mt-2">
              <div className="flex gap-1 overflow-x-auto scrollbar-none pb-2">
                <Link href="/directory"
                  className={`flex-shrink-0 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${!activeCategory ? 'bg-gray-950 text-white' : 'text-gray-500'}`}>
                  All
                </Link>
                {CATEGORIES.map((p) => (
                  <Link key={p.slug} href={`/directory/${p.slug}`}
                    className="flex-shrink-0 px-3 py-1.5 rounded text-sm cursor-pointer text-gray-500 hover:text-gray-950 transition-colors whitespace-nowrap">
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0" ref={gridRef}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-400">
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching...</span>
                  ) : (
                    <><span className="text-gray-950 font-medium">{total}</span> {total === 1 ? 'business' : 'businesses'}{activeCategory && <> in {activeCategory}</>}{search && <> matching &ldquo;{search}&rdquo;</>}</>
                  )}
                </p>
                {hasFilters && !loading && (
                  <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-gray-950 cursor-pointer transition-colors">Clear</button>
                )}
              </div>

              {initialLoad && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => <BusinessCardSkeleton key={i} />)}
                </div>
              )}

              {!loading && !initialLoad && businesses.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-sm text-gray-400 mb-4">{hasFilters ? 'No businesses match your filters.' : 'No businesses listed yet.'}</p>
                  {hasFilters ? (
                    <button onClick={clearFilters} className="text-sm text-gray-950 font-medium hover:underline cursor-pointer">Clear filters</button>
                  ) : (
                    <Link href="/create-business" className="text-sm text-gray-950 font-medium hover:underline">List your business &rarr;</Link>
                  )}
                </div>
              )}

              {!initialLoad && businesses.length > 0 && (
                <>
                  <div className={`grid sm:grid-cols-2 gap-3 ${loading && !initialLoad ? 'opacity-40' : ''} transition-opacity`}>
                    {businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-10">
                      <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-950 disabled:opacity-30 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                      <span className="px-3 py-1.5 text-sm text-gray-400">Page <span className="text-gray-950 font-medium">{page}</span> of {totalPages}</span>
                      <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-950 disabled:opacity-30 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
