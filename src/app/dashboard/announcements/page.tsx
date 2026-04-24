'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, Megaphone, Pin, X } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string | null;
  isPinned: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', isPinned: false });

  const fetchItems = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/announcements?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { announcements?: Announcement[] } = await res.json();
      setItems(data.announcements || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [business]);

  const addItem = async () => {
    if (!form.title.trim() || !business) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/business/announcements?businessId=${business.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: '', content: '', isPinned: false });
        setShowForm(false);
        await fetchItems();
      }
    } finally { setAdding(false); }
  };

  const deleteItem = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/announcements/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setItems(items.filter((i) => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      {business && <ModuleToggle moduleKey="announcements" label="Announcements" businessId={business.id} enabledModules={business.enabledModules} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
          <p className="text-sm text-gray-500 mt-0.5">Share news, offers, and updates</p>
        </div>
        {!showForm && items.length > 0 && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> New post
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">New announcement</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What's new?"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Details <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="More details..."
              rows={3}
            />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              form.isPinned ? 'bg-gray-950 border-gray-950' : 'border-gray-300 group-hover:border-gray-400'
            }`}>
              {form.isPinned && <Pin className="h-3 w-3 text-white" />}
            </div>
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              className="sr-only"
            />
            <span className="text-sm text-gray-600">Pin to top</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)}
              className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">Cancel</button>
            <button onClick={addItem} disabled={adding || !form.title.trim()}
              className="h-9 px-4 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post announcement'}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">No announcements yet</p>
          <p className="text-xs text-gray-400 mt-1">Share news and updates with your visitors</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
            <Plus className="h-4 w-4 inline mr-1" /> Create first post
          </button>
        </div>
      ) : items.length > 0 && (
        <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-950">{item.title}</h3>
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </span>
                    )}
                  </div>
                  {item.content && (
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.content}</p>
                  )}
                  <p className="text-[11px] text-gray-300 mt-2">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => deleteItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
