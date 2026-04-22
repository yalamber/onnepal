'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  ArrowRight,
} from 'lucide-react';
import { CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  category: string;
  location: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  imageUrls: string | null;
  status: string;
  createdAt: string;
  userName: string | null;
  userSubdomain: string | null;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface APIResponse {
  listings: Listing[];
  total: number;
  page: number;
  totalPages: number;
  categories: CategoryCount[];
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

function getFirstImageUrl(imageUrls: string | null): string | null {
  if (!imageUrls) return null;
  try {
    const urls = JSON.parse(imageUrls) as string[];
    return urls.length > 0 ? urls[0] : null;
  } catch {
    return null;
  }
}

function formatPrice(price: string | null): string | null {
  if (!price) return null;
  return price;
}

export default function ClassifiedsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const limit = 12;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeSearch) params.set('search', activeSearch);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/classifieds?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as APIResponse;
        setListings(data.listings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setCategoryCounts(data.categories);
      }
    } catch {
      // Network error — leave current state
    } finally {
      setLoading(false);
    }
  }, [activeSearch, page, limit]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  const getCategoryCount = (categoryName: string): number => {
    const found = categoryCounts.find((c) => c.category === categoryName);
    return found ? found.count : 0;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-medium mb-6 backdrop-blur-sm">
            <Package className="w-3.5 h-3.5" />
            Free to post &middot; Local to Nepal
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
            Nepal Classifieds
          </h1>
          <p className="mt-3 text-base sm:text-lg text-indigo-100 max-w-xl mx-auto leading-relaxed">
            Buy, sell, and find services across Nepal
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search classifieds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-28 rounded-xl bg-white text-gray-900 placeholder-gray-400 border-0 shadow-lg shadow-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
              <button
                type="submit"
                className="absolute right-1.5 h-9 px-5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Post Ad CTA */}
          <div className="mt-5">
            <Link
              href="/classifieds/post/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20"
            >
              <Plus className="w-4 h-4" />
              Post Free Ad
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Grid */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CLASSIFIED_CATEGORIES.map((cat) => {
              const count = getCategoryCount(cat.name);
              return (
                <Link
                  key={cat.slug}
                  href={`/classifieds/${cat.slug}`}
                  className="group flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 transition-all duration-200"
                >
                  <span className="text-2xl flex-shrink-0">{cat.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {cat.name}
                    </p>
                    {count > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {count} {count === 1 ? 'listing' : 'listings'}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Latest Listings */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeSearch ? `Results for "${activeSearch}"` : 'Latest Listings'}
            </h2>
            {total > 0 && (
              <p className="text-sm text-gray-400">
                {total} {total === 1 ? 'listing' : 'listings'}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <p className="mt-3 text-sm text-gray-400">Loading listings...</p>
            </div>
          ) : listings.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No listings found</h3>
              <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">
                {activeSearch
                  ? `No results for "${activeSearch}". Try a different search term.`
                  : 'Be the first to post a classified ad.'}
              </p>
              <Link
                href="/classifieds/post/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Post Free Ad
              </Link>
            </div>
          ) : (
            <>
              {/* Listing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => {
                  const imageUrl = getFirstImageUrl(listing.imageUrls);
                  const price = formatPrice(listing.price);
                  const catInfo = CLASSIFIED_CATEGORIES.find(
                    (c) => c.name === listing.category || c.slug === listing.category,
                  );

                  return (
                    <Link
                      key={listing.id}
                      href={`/classifieds/post/${listing.id}`}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-300 transition-all duration-200"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-10 h-10 text-gray-300" />
                          </div>
                        )}
                        {/* Category Badge */}
                        {catInfo && (
                          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 shadow-sm">
                            <span>{catInfo.icon}</span>
                            {catInfo.name}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3.5">
                        {/* Price */}
                        {price && (
                          <p className="text-base font-bold text-emerald-600 mb-1">{price}</p>
                        )}

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                          {listing.title}
                        </h3>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-400">
                          {listing.location && (
                            <span className="inline-flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{listing.location}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {timeAgo(listing.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        // Show first, last, current, and neighbors
                        if (p === 1 || p === totalPages) return true;
                        if (Math.abs(p - page) <= 1) return true;
                        return false;
                      })
                      .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                          acc.push('ellipsis');
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === 'ellipsis' ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-9 h-9 flex items-center justify-center text-sm text-gray-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setPage(item as number)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              page === item
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {item}
                          </button>
                        ),
                      )}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="mt-12 mb-8 text-center">
          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Have something to sell?</h3>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
              Post your classified ad for free and reach thousands of buyers across Nepal.
            </p>
            <Link
              href="/classifieds/post/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Post Free Ad
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
