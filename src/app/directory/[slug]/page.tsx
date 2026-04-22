'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Loader2, ChevronLeft, ChevronRight, FolderOpen, ArrowLeft,
} from 'lucide-react';
import { BusinessCard, BusinessCardSkeleton } from '@/components/business-card';
import type { BusinessCardData } from '@/components/business-card';
import { getCategoryBySlug, CATEGORIES, getSlugFromName } from '@/lib/categories';

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

  const fetchBusinesses = useCallback(
    async (currentPage: number, currentSearch: string) => {
      if (!category) return;
      setLoading(true);

      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(ITEMS_PER_PAGE));
      params.set('category', category.name);
      if (currentSearch) params.set('search', currentSearch);

      try {
        const res = await fetch(`/api/directory?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json() as {
          businesses: BusinessCardData[];
          total: number;
          page: number;
          totalPages: number;
        };

        setBusinesses(data.businesses);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch {
        setBusinesses([]);
        setTotal(0);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [category]
  );

  useEffect(() => {
    if (category) fetchBusinesses(1, '');
  }, [category, fetchBusinesses]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchBusinesses(1, value);
    }, 350);
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
    fetchBusinesses(newPage, search);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <FolderOpen className="h-12 w-12 text-gray-300 mb-4" />
        <h1 className="text-lg font-bold text-gray-900 mb-2">Category not found</h1>
        <p className="text-sm text-gray-500 mb-6">This category doesn't exist.</p>
        <Link href="/directory" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to directory
        </Link>
      </div>
    );
  }

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== -1) {
      pageNumbers.push(-1);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link href="/directory" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> All categories
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {category.name}
              </h1>
              <p className="text-gray-500 mt-1">
                {total} {total === 1 ? 'business' : 'businesses'} listed
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={`Search in ${category.name}...`}
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Other categories */}
      <section className="bg-gray-50/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
              <Link
                key={c.slug}
                href={`/directory/${c.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-500 hover:border-indigo-200 hover:text-indigo-600 transition-colors whitespace-nowrap flex-shrink-0"
              >
                <span>{c.icon}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={gridRef}>
        {initialLoad ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <BusinessCardSkeleton key={i} />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {search ? 'No results found' : 'No businesses yet'}
            </h3>
            <p className="text-sm text-gray-500">
              {search
                ? `No businesses match "${search}" in ${category.name}.`
                : `Be the first ${category.name} listed on OnNepal.`}
            </p>
            {!search && (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                List your business
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ${loading && !initialLoad ? 'opacity-60' : ''} transition-opacity`}>
              {businesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {pageNumbers.map((p, i) =>
                  p === -1 ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-gray-300">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
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
