'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Loader2, Megaphone, Pin } from 'lucide-react';

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

  useEffect(() => {
    fetchItems();
  }, []);

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="text-[1.375rem] font-bold tracking-[-0.025em] text-neutral-950 leading-[1.2]">Announcements</h1>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-neutral-950 text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">New Announcement</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What's new?" />
            </div>
            <div>
              <Label>Details (optional)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="More details..." rows={3} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="rounded"
              />
              Pin this announcement
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={addItem} disabled={adding || !form.title.trim()} className="bg-neutral-950 text-white hover:bg-neutral-800">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-400">No announcements yet.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-neutral-200">
              {item.isPinned && <Pin className="h-4 w-4 text-neutral-400 mt-1 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-neutral-900">{item.title}</p>
                {item.content && <p className="text-xs text-neutral-400 mt-1">{item.content}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-neutral-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
