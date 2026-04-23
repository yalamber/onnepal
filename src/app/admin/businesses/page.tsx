'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, X, Trash2, ExternalLink } from 'lucide-react';

interface Business {
  id: string;
  subdomain: string;
  businessName: string;
  businessCategory: string | null;
  isPublished: boolean;
  createdAt: string;
  ownerEmail: string | null;
  ownerName: string | null;
}

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return 'just now';
}

export default function AdminBusinesses() {
  const [items, setItems] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/businesses');
      const data = await res.json() as { businesses: Business[] };
      setItems(data.businesses || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const togglePublish = async (id: string, publish: boolean) => {
    setActing(id);
    try {
      await fetch(`/api/admin/businesses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: publish }),
      });
      setItems(items.map(b => b.id === id ? { ...b, isPublished: publish } : b));
    } finally { setActing(null); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this business permanently?')) return;
    setActing(id);
    try {
      await fetch(`/api/admin/businesses/${id}`, { method: 'DELETE' });
      setItems(items.filter(b => b.id !== id));
    } finally { setActing(null); }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Businesses</h1>
        <p className="mt-1 text-gray-400">{items.length} total. Publish or remove businesses.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-12 text-center">No businesses yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((b) => (
            <div key={b.id} className="py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-950 truncate">{b.businessName}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {b.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <a href={`https://${b.subdomain}.onnepal.com`} target="_blank" rel="noopener noreferrer" className="font-mono hover:text-gray-950 flex items-center gap-0.5">
                    {b.subdomain}.onnepal.com <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  {b.businessCategory && <span>{b.businessCategory}</span>}
                  <span>{b.ownerEmail}</span>
                  <span>{timeAgo(b.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {acting === b.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <>
                    {b.isPublished ? (
                      <button onClick={() => togglePublish(b.id, false)} title="Unpublish"
                        className="p-1.5 text-gray-400 hover:text-amber-600 cursor-pointer transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <button onClick={() => togglePublish(b.id, true)} title="Publish"
                        className="p-1.5 text-gray-400 hover:text-green-600 cursor-pointer transition-colors">
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => remove(b.id)} title="Delete"
                      className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
