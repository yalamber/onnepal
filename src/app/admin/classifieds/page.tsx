'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trash2, Eye, EyeOff } from 'lucide-react';
import { timeAgo } from '@/lib/time-ago';

interface Classified {
  id: string;
  title: string;
  category: string;
  price: string | null;
  location: string | null;
  status: string;
  createdAt: string;
  ownerEmail: string | null;
  ownerName: string | null;
}

export default function AdminClassifieds() {
  const [items, setItems] = useState<Classified[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/classifieds');
      const data = await res.json() as { classifieds: Classified[] };
      setItems(data.classifieds || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const setStatus = async (id: string, status: string) => {
    setActing(id);
    try {
      await fetch(`/api/admin/classifieds/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setItems(items.map(c => c.id === id ? { ...c, status } : c));
    } finally { setActing(null); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this classified ad permanently?')) return;
    setActing(id);
    try {
      await fetch(`/api/admin/classifieds/${id}`, { method: 'DELETE' });
      setItems(items.filter(c => c.id !== id));
    } finally { setActing(null); }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Classifieds</h1>
        <p className="mt-1 text-gray-400">{items.length} total. Moderate classified ads.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-12 text-center">No classifieds yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((c) => (
            <div key={c.id} className="py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-950 truncate">{c.title}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    c.status === 'active' ? 'bg-green-50 text-green-600' : c.status === 'sold' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>{c.category}</span>
                  {c.price && <span>{c.price}</span>}
                  {c.location && <span>{c.location}</span>}
                  <span>{c.ownerEmail}</span>
                  <span>{timeAgo(c.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {acting === c.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <>
                    {c.status === 'active' ? (
                      <button onClick={() => setStatus(c.id, 'expired')} title="Deactivate"
                        className="p-1.5 text-gray-400 hover:text-amber-600 cursor-pointer transition-colors">
                        <EyeOff className="h-4 w-4" />
                      </button>
                    ) : (
                      <button onClick={() => setStatus(c.id, 'active')} title="Activate"
                        className="p-1.5 text-gray-400 hover:text-green-600 cursor-pointer transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => remove(c.id)} title="Delete"
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
