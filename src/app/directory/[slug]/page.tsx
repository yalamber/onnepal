'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { BusinessCard, BusinessCardSkeleton } from '@/components/business-card';
import type { BusinessCardData } from '@/components/business-card';
import { getCategoryBySlug, CATEGORIES } from '@/lib/categories';

const ITEMS_PER_PAGE = 12;

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = getCategoryBySlug(slug);

  const [businesses, setBusinesses] = useState<BusinessCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchBusinesses = useCallback(async (p: number, s: string) => {
    if (!category) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', String(ITEMS_PER_PAGE));
    params.set('category', category.name);
    if (s) params.set('search', s);
    try {
      const res = await fetch(`/api/directory?${params}`);
      const data = await res.json() as { businesses: BusinessCardData[]; total: number; totalPages: number };
      setBusinesses(data.businesses); setTotal(data.total); setTotalPages(data.totalPages);
    } catch { setBusinesses([]); }
    finally { setLoading(false); setInitialLoad(false); }
  }, [category]);

  useEffect(() => { if (category) fetchBusinesses(1, ''); }, [category, fetchBusinesses]);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => { setPage(1); fetchBusinesses(1, v); }, 350);
  };

  const goToPage = (p: number) => {
    setPage(p); fetchBusinesses(p, search);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-sm text-gray-400 mb-4">Category not found.</p>
        <Link href="/directory" className="text-sm text-gray-950 font-medium hover:underline">&larr; Back to directory</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="pt-12 sm:pt-16 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/directory" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">&larr; All categories</Link>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">{category.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{total} {total === 1 ? 'business' : 'businesses'}</p>
            </div>
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
          {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
            <Link key={c.slug} href={`/directory/${c.slug}`} className="flex-shrink-0 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-950 transition-colors whitespace-nowrap">
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-px bg-gray-100" /></div>

      {/* Results */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={gridRef}>
        {initialLoad ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <BusinessCardSkeleton key={i} />)}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm text-gray-400 mb-4">
              {search ? `No businesses match "${search}".` : `No businesses listed in ${category.name} yet.`}
            </p>
            {!search && (
              <Link href="/create-business" className="text-sm text-gray-950 font-medium hover:underline">List your business &rarr;</Link>
            )}
          </div>
        ) : (
          <>
            <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-3 ${loading && !initialLoad ? 'opacity-40' : ''} transition-opacity`}>
              {businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
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
