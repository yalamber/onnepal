'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Button } from '@/components/ui/button';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {business && <ModuleToggle moduleKey="announcements" label="Announcements" businessId={business.id} enabledModules={business.enabledModules} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
          <p className="text-sm text-gray-500 mt-0.5">Share news, offers, and updates</p>
        </div>
        {!showForm && items.length > 0 && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> New post
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">New announcement</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
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
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
              form.isPinned ? 'bg-amber-500 border-amber-500' : 'border-gray-300 group-hover:border-gray-400'
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
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={addItem} disabled={adding || !form.title.trim()} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post announcement'}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <Megaphone className="h-6 w-6 text-amber-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No announcements yet</p>
          <p className="text-xs text-gray-400 mt-1">Share news and updates with your visitors</p>
          <Button onClick={() => setShowForm(true)} size="sm" className="mt-4 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Create first post
          </Button>
        </div>
      ) : items.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-gray-900">{item.title}</h3>
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-300 hover:text-red-500 h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
