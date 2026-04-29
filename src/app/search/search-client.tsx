'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { imageUrl } from '@/components/image-upload';
import { EmptyState } from '@/components/empty-state';

interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  type: 'classified' | 'job' | 'event' | 'lost-found' | 'place' | 'directory';
  imageUrl: string | null;
  href: string;
}

interface SearchResults {
  classifieds: SearchResult[];
  jobs: SearchResult[];
  events: SearchResult[];
  lostFound: SearchResult[];
  places: SearchResult[];
  directory: SearchResult[];
}

const SECTION_CONFIG = [
  { key: 'classifieds' as const, label: 'Classifieds', seeAllHref: '/classifieds' },
  { key: 'jobs' as const, label: 'Jobs', seeAllHref: '/jobs' },
  { key: 'events' as const, label: 'Events', seeAllHref: '/events' },
  { key: 'lostFound' as const, label: 'Lost & Found', seeAllHref: '/lost-found' },
  { key: 'places' as const, label: 'Places', seeAllHref: '/places' },
  { key: 'directory' as const, label: 'Businesses', seeAllHref: '/directory' },
];

const TYPE_BADGES: Record<string, string> = {
  classified: 'Classified',
  job: 'Job',
  event: 'Event',
  'lost-found': 'Lost & Found',
  place: 'Place',
  directory: 'Business',
};

export default function SearchClient({ initialQuery, initialResults }: { initialQuery?: string; initialResults?: SearchResults }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState<SearchResults | null>(initialResults || null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialResults);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json() as SearchResults;
        setResults(data);
        setSearched(true);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (initialResults && query === initialQuery) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const hasResults = results && SECTION_CONFIG.some((s) => results[s.key].length > 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search classifieds, jobs, events, businesses..."
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-950/10"
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}

        {!loading && searched && !hasResults && (
          <EmptyState icon={Search} title="No results found" subtitle={`Nothing matched "${query}"`} />
        )}

        {!loading && hasResults && results && (
          <div className="space-y-8">
            {SECTION_CONFIG.map((section) => {
              const items = results[section.key];
              if (items.length === 0) return null;
              const seeAllHref = `${section.seeAllHref}?search=${encodeURIComponent(query)}`;
              return (
                <div key={section.key}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-950">{section.label}</h2>
                    <Link href={seeAllHref} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-950 transition-colors">
                      See all <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <ResultRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({ item }: { item: SearchResult }) {
  const thumb = item.imageUrl ? imageUrl(item.imageUrl) : null;
  const isExternal = item.href.startsWith('http');

  const content = (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
      {thumb && (
        <img src={thumb} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" loading="lazy" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-950 group-hover:text-gray-700 truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{item.description.slice(0, 100)}</p>
        )}
      </div>
      <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
        {TYPE_BADGES[item.type] || item.type}
      </span>
    </div>
  );

  if (isExternal) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={item.href}>{content}</Link>;
}
