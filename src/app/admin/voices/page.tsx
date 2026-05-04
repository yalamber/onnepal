'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, Trash2, Star, ExternalLink, Check, X, RefreshCw } from 'lucide-react';

interface VoiceRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  city: string | null;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  isFeatured: boolean;
  publishedAt: number | null;
  createdAt: number;
  userId: string;
  ownerEmail: string | null;
  ownerName: string | null;
}

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: '',           label: 'All' },
  { key: 'pending',    label: 'Pending' },
  { key: 'published',  label: 'Published' },
  { key: 'rejected',   label: 'Rejected' },
  { key: 'draft',      label: 'Drafts' },
];

const STATUS_PILL: Record<VoiceRow['status'], string> = {
  pending:   'bg-[var(--saffron-100)] text-[var(--saffron-600)]',
  published: 'bg-[var(--evergreen-100)] text-[var(--evergreen-700)]',
  rejected:  'bg-[var(--crimson-100)] text-[var(--crimson-700)]',
  draft:     'bg-[var(--ink-100)] text-[var(--ink-700)]',
};

function formatDate(v: number | string | null): string {
  if (!v) return '—';
  const ms = typeof v === 'string' ? new Date(v).getTime() : v;
  if (!Number.isFinite(ms)) return '—';
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminVoicesPage() {
  const [items, setItems] = useState<VoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('pending');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filter ? `/api/admin/voices?status=${filter}` : '/api/admin/voices';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = await res.json() as { voices: VoiceRow[]; statusCounts: Record<string, number> };
      setItems(data.voices || []);
      setCounts(data.statusCounts || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const mutate = async (id: string, body: { status?: string; isFeatured?: boolean }, optimistic: Partial<VoiceRow>) => {
    setActing(id);
    setItems((prev) => prev.map((v) => v.id === id ? { ...v, ...optimistic } : v));
    try {
      const res = await fetch(`/api/admin/voices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      await fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setActing(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this voice permanently? The author will not be notified.')) return;
    setActing(id);
    try {
      const res = await fetch(`/api/admin/voices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setItems((prev) => prev.filter((v) => v.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="t-display" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}>
            Voices <em>moderation.</em>
          </h1>
          <p className="text-[var(--ink-500)] text-sm mt-2">
            Approve pending submissions, mark editor picks for the homepage, or reject spam.
          </p>
        </div>
        <button
          onClick={fetchItems}
          className="btn btn-ghost"
          aria-label="Refresh"
          type="button"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const n = f.key === '' ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[f.key] ?? 0;
          const isActive = filter === f.key;
          return (
            <button
              key={f.key || 'all'}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-[var(--r-pill)] text-sm border transition-colors ${
                isActive
                  ? 'bg-[var(--ink-900)] text-[var(--paper)] border-[var(--ink-900)]'
                  : 'bg-[var(--paper)] text-[var(--ink-700)] border-[var(--ink-200)] hover:border-[var(--ink-900)] hover:text-[var(--ink-900)]'
              }`}
            >
              {f.label} <span className="opacity-60 ml-1">{n}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-[var(--crimson-100)] bg-[var(--crimson-100)]/40 px-4 py-3 text-sm text-[var(--crimson-700)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-[var(--ink-400)]" /></div>
      ) : items.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--ink-200)] rounded-[var(--r-lg)] py-16 text-center">
          <p className="t-eyebrow justify-center mb-3">No voices</p>
          <p className="text-[var(--ink-500)]">Nothing matches this filter.</p>
        </div>
      ) : (
        <div className="border border-[var(--ink-200)] rounded-[var(--r-lg)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--ink-50)] border-b border-[var(--ink-200)]">
              <tr className="text-left">
                <th className="px-4 py-3 t-meta">Title</th>
                <th className="px-4 py-3 t-meta">Author</th>
                <th className="px-4 py-3 t-meta">City</th>
                <th className="px-4 py-3 t-meta">Status</th>
                <th className="px-4 py-3 t-meta">Created</th>
                <th className="px-4 py-3 t-meta text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id} className="border-b border-[var(--ink-100)] last:border-0">
                  <td className="px-4 py-4 align-top">
                    <Link href={`/voices/${v.slug}`} className="font-medium text-[var(--ink-900)] hover:text-[var(--accent)] inline-flex items-center gap-1.5" target="_blank">
                      {v.title}
                      <ExternalLink className="h-3 w-3 opacity-40" />
                    </Link>
                    {v.excerpt && <p className="text-[var(--ink-500)] mt-1 line-clamp-1 text-xs">{v.excerpt}</p>}
                    <div className="t-meta mt-1.5 flex items-center gap-2">
                      {v.category && <span>{v.category}</span>}
                      {v.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[var(--saffron-600)]">
                          <Star className="h-3 w-3 fill-current" /> Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="text-[var(--ink-900)]">{v.ownerName || '—'}</div>
                    <div className="t-meta">{v.ownerEmail}</div>
                  </td>
                  <td className="px-4 py-4 align-top text-[var(--ink-700)]">{v.city || '—'}</td>
                  <td className="px-4 py-4 align-top">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-medium ${STATUS_PILL[v.status]}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top t-meta">{formatDate(v.createdAt)}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-1.5 justify-end flex-wrap">
                      {v.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => mutate(v.id, { status: 'published' }, { status: 'published' })}
                          disabled={acting === v.id}
                          className="px-2.5 py-1 rounded-md border border-[var(--evergreen-600)] text-[var(--evergreen-700)] hover:bg-[var(--evergreen-100)] text-xs inline-flex items-center gap-1 disabled:opacity-50"
                          title="Approve & publish"
                        >
                          <Check className="h-3 w-3" /> Publish
                        </button>
                      )}
                      {v.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => mutate(v.id, { status: 'rejected' }, { status: 'rejected' })}
                          disabled={acting === v.id}
                          className="px-2.5 py-1 rounded-md border border-[var(--crimson-600)] text-[var(--crimson-700)] hover:bg-[var(--crimson-100)] text-xs inline-flex items-center gap-1 disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="h-3 w-3" /> Reject
                        </button>
                      )}
                      {v.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => mutate(v.id, { isFeatured: !v.isFeatured }, { isFeatured: !v.isFeatured })}
                          disabled={acting === v.id}
                          className={`px-2.5 py-1 rounded-md border text-xs inline-flex items-center gap-1 disabled:opacity-50 ${
                            v.isFeatured
                              ? 'border-[var(--saffron-600)] bg-[var(--saffron-100)] text-[var(--saffron-600)]'
                              : 'border-[var(--ink-200)] text-[var(--ink-700)] hover:border-[var(--saffron-600)] hover:text-[var(--saffron-600)]'
                          }`}
                          title={v.isFeatured ? 'Unfeature' : 'Feature on homepage'}
                        >
                          <Star className={`h-3 w-3 ${v.isFeatured ? 'fill-current' : ''}`} />
                          {v.isFeatured ? 'Featured' : 'Feature'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(v.id)}
                        disabled={acting === v.id}
                        className="px-2.5 py-1 rounded-md text-[var(--ink-400)] hover:text-[var(--crimson-700)] text-xs inline-flex items-center disabled:opacity-50"
                        title="Delete permanently"
                      >
                        {acting === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
