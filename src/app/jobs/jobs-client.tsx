'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, MapPin, Clock, Briefcase, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES } from '@/lib/job-categories';

interface Job {
  id: string; title: string; company: string; description: string | null; category: string;
  type: string; location: string | null; isRemote: boolean; salary: string | null;
  experience: string | null; createdAt: string;
}

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return 'just now';
}

export interface JobsInitialData {
  items: Job[];
  total: number;
}

export default function JobsClient({ initialData }: { initialData: JobsInitialData }) {
  const [items, setItems] = useState<Job[]>(initialData.items);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialData.total / 12));
  const [total, setTotal] = useState(initialData.total);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (type) params.set('type', type);
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
  }, [category, type, search, page]);

  useEffect(() => { if (category || type || search || page > 1) fetchItems(); }, [fetchItems]);
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, companies..."
              className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors" />
          </div>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-md border border-gray-200 text-sm bg-white focus:outline-none focus:border-gray-400 transition-colors">
            <option value="">All types</option>
            {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-6 pb-1">
          <button onClick={() => { setCategory(''); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-md font-medium cursor-pointer transition-colors ${!category ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            All
          </button>
          {JOB_CATEGORIES.map((c) => (
            <button key={c.slug} onClick={() => { setCategory(c.name); setPage(1); }}
              className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-md font-medium cursor-pointer transition-colors ${category === c.name ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-lg">
            <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">No jobs found</p>
            <p className="text-xs text-gray-400 mt-1">Post a job to start hiring</p>
          </div>
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
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-md border border-gray-200 text-gray-400 hover:text-gray-950 disabled:opacity-30 cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-md border border-gray-200 text-gray-400 hover:text-gray-950 disabled:opacity-30 cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
