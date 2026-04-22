'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  Building2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  X,
} from 'lucide-react';
import { BusinessCard, BusinessCardSkeleton } from '@/components/business-card';
import type { BusinessCardData } from '@/components/business-card';

interface CategoryInfo {
  category: string;
  count: number;
}

const ALL_CATEGORIES = [
  'Restaurant & Cafe',
  'Retail Shop',
  'Beauty & Salon',
  'Hotel & Travel',
  'Education',
  'Health & Fitness',
  'Technology',
  'Construction',
  'Agriculture',
  'Fashion',
  'Photography',
  'Other',
];

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

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchBusinesses = useCallback(
    async (currentPage: number, currentSearch: string, currentCategory: string) => {
      setLoading(true);

      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(ITEMS_PER_PAGE));
      if (currentSearch) params.set('search', currentSearch);
      if (currentCategory) params.set('category', currentCategory);

      try {
        const res = await fetch(`/api/directory?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json() as {
          businesses: BusinessCardData[];
          total: number;
          page: number;
          totalPages: number;
          categories: CategoryInfo[];
        };

        setBusinesses(data.businesses);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setCategories(data.categories);
      } catch (error) {
        console.error('Failed to fetch directory:', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchBusinesses(1, '', '');
  }, [fetchBusinesses]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchBusinesses(1, value, activeCategory);
    }, 350);
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = category === activeCategory ? '' : category;
    setActiveCategory(newCategory);
    setPage(1);
    fetchBusinesses(1, search, newCategory);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchBusinesses(newPage, search, activeCategory);
    // Scroll to grid
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('');
    setPage(1);
    fetchBusinesses(1, '', '');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  const hasFilters = search || activeCategory;

  // Build category list: merge fetched counts with all known categories
  const categoryList = ALL_CATEGORIES.map((cat) => {
    const found = categories.find((c) => c.category === cat);
    return { category: cat, count: found?.count ?? 0 };
  });

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-6">
            <Building2 className="h-3.5 w-3.5" />
            Discover Nepali Businesses
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Nepal Business Directory
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Find and connect with businesses across Nepal. Browse by category or search for what you need.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search businesses..."
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
            />
            {search && (
              <button
                onClick={() => {
                  handleSearchChange('');
                  if (searchInputRef.current) searchInputRef.current.value = '';
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative gradient blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-50/40 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
      </section>

      {/* Category filters */}
      <section className="sticky top-14 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => handleCategoryChange('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !activeCategory
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categoryList.map(({ category, count }) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
                {count > 0 && (
                  <span
                    className={`ml-1.5 text-xs ${
                      activeCategory === category
                        ? 'text-indigo-200'
                        : 'text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10" ref={gridRef}>
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching...
              </span>
            ) : (
              <>
                <span className="font-semibold text-gray-900">{total}</span>{' '}
                {total === 1 ? 'business' : 'businesses'} found
                {activeCategory && (
                  <span>
                    {' '}in <span className="font-medium text-gray-700">{activeCategory}</span>
                  </span>
                )}
                {search && (
                  <span>
                    {' '}matching &ldquo;<span className="font-medium text-gray-700">{search}</span>&rdquo;
                  </span>
                )}
              </>
            )}
          </p>
          {hasFilters && !loading && (
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Loading state */}
        {initialLoad && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <BusinessCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !initialLoad && businesses.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
              <FolderOpen className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No businesses found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {hasFilters
                ? 'Try adjusting your search or filters to find what you are looking for.'
                : 'No published businesses yet. Be the first to create your page!'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Business grid */}
        {!initialLoad && businesses.length > 0 && (
          <>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${
                loading ? 'opacity-50 pointer-events-none' : 'opacity-100'
              }`}
            >
              {businesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((p, i) =>
                  p === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="w-10 h-10 flex items-center justify-center text-sm text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === p
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
