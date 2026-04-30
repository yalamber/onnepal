'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Clock, Briefcase, Loader2 } from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES } from '@/lib/job-categories';
import { timeAgo } from '@/lib/time-ago';
import { SearchInput } from '@/components/search-input';
import { Pagination } from '@/components/pagination';
import { EmptyState } from '@/components/empty-state';
import { CategorySidebar, CategoryMobilePills } from '@/components/category-nav';
import { CitySelector } from '@/components/city-selector';

interface Job {
  id: string; title: string; company: string; description: string | null; category: string;
  type: string; location: string | null; isRemote: boolean; salary: string | null;
  experience: string | null; createdAt: string;
}

export interface JobsInitialData {
  items: Job[];
  total: number;
}

export default function JobsClient({ initialData, initialCategory }: { initialData: JobsInitialData; initialCategory?: string }) {
  const [items, setItems] = useState<Job[]>(initialData.items);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const categorySlug = initialCategory || '';
  const [type, setType] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialData.total / 12));
  const [total, setTotal] = useState(initialData.total);

  useEffect(() => {
    setItems(initialData.items);
    setTotal(initialData.total);
    setTotalPages(Math.ceil(initialData.total / 12));
    setPage(1);
  }, [initialCategory]);

  // CategorySidebar/MobilePills use slug, but API expects category name
  const categoryNameFromSlug = (slug: string) => JOB_CATEGORIES.find(c => c.slug === slug)?.name || '';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const catName = categoryNameFromSlug(categorySlug);
      if (catName) params.set('category', catName);
      if (type) params.set('type', type);
      if (city) params.set('city', city);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '12');
      const res = await fetch(`/api/jobs?${params}`);
      if (res.ok) {
        const data = await res.json() as { items: Job[]; total: number; totalPages: number };
        setItems(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {} finally { setLoading(false); }
  }, [type, city, search, page]);

  useEffect(() => { fetchItems(); }, [type, city, page]);
  useEffect(() => { const t = setTimeout(() => { if (search) { setPage(1); fetchItems(); } }, 350); return () => clearTimeout(t); }, [search]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Jobs</h1>
            <p className="text-sm text-gray-500 mt-0.5">Find your next opportunity in Nepal</p>
          </div>
          <Link href="/jobs/post/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Post job
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search jobs, companies..." />
          </div>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-md border border-gray-200 text-sm bg-white focus:outline-none focus:border-gray-400 transition-colors">
            <option value="">All types</option>
            {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="w-full sm:w-48">
            <CitySelector value={city} onChange={(v) => { setCity(v); setPage(1); }} />
          </div>
        </div>

        <div className="mb-6">
          <CategoryMobilePills categories={JOB_CATEGORIES} activeCategory={categorySlug} basePath="/jobs" allLabel="All" />
        </div>

        <div className="flex lg:gap-10">
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <CategorySidebar categories={JOB_CATEGORIES} activeCategory={categorySlug} basePath="/jobs" allLabel="All jobs" />
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs found" subtitle="Post a job to start hiring" />
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{total} {total === 1 ? 'job' : 'jobs'}</p>
            <div className="space-y-2">
              {items.map((item) => (
                <Link key={item.id} href={`/jobs/${item.id}`}
                  className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group">
                  <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs font-bold">
                    {item.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-950 group-hover:text-gray-700">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{item.company}</p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-medium text-gray-600">{JOB_TYPES.find(t => t.value === item.type)?.label || item.type}</span>
                      {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>}
                      {item.isRemote && <span className="text-green-600 font-medium">Remote</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(item.createdAt)}</span>
                    </div>
                  </div>
                  {item.salary && <p className="text-sm font-medium text-gray-950 flex-shrink-0">{item.salary}</p>}
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}
