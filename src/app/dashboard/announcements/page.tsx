'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', isPinned: false });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/business/announcements');
      if (res.status === 401) { router.push('/login'); return; }
      const data: { announcements?: Announcement[] } = await res.json();
      setItems(data.announcements || []);
    } catch {} finally { setLoading(false); }
  };

  const addItem = async () => {
    if (!form.title.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/business/announcements', {
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
    await fetch(`/api/business/announcements/${id}`, { method: 'DELETE' });
    setItems(items.filter((i) => i.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Add button / form */}
      {showForm ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900">New announcement</p>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What's new?" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Details <span className="text-slate-400 font-normal">optional</span></Label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="More details..." rows={3} className="mt-1" />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              className="rounded"
            />
            Pin this announcement
          </label>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={addItem} disabled={adding || !form.title.trim()} size="sm">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-sm font-medium text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add announcement
        </button>
      )}

      {/* List */}
      <div className="space-y-1.5">
        {items.length === 0 && !showForm ? (
          <div className="text-center py-12">
            <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No announcements yet</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/60">
              {item.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900">{item.title}</p>
                {item.content && <p className="text-xs text-slate-400 mt-0.5">{item.content}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-slate-400 hover:text-red-500 h-8 w-8">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
