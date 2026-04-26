'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/lib/event-categories';
import { ImageUpload } from '@/components/image-upload';

export default function PostEventPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', category: '', description: '', startDate: '', endDate: '', startTime: '', endTime: '',
    venue: '', location: '', ticketPrice: '', ticketUrl: '', contactPhone: '', contactWhatsapp: '',
    imageUrls: [] as string[],
  });

  useEffect(() => { fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); else setAuthed(true); }); }, [router]);

  const handleSubmit = async () => {
    if (!form.title.trim() || form.title.length < 3) { setError('Title must be at least 3 characters'); return; }
    if (!form.category) { setError('Please select a category'); return; }
    if (!form.startDate) { setError('Start date is required'); return; }

    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, description: form.description || null, endDate: form.endDate || null,
          startTime: form.startTime || null, endTime: form.endTime || null, venue: form.venue || null,
          location: form.location || null, ticketPrice: form.ticketPrice || null, ticketUrl: form.ticketUrl || null,
          contactPhone: form.contactPhone || null, contactWhatsapp: form.contactWhatsapp || null,
          imageUrls: form.imageUrls.length > 0 ? form.imageUrls : undefined }),
      });
      if (!res.ok) { const d = await res.json().catch(() => null) as { error?: string } | null; setError(d?.error || 'Failed'); return; }
      const data = await res.json() as { id: string };
      router.push(`/events/${data.id}`);
    } catch { setError('Something went wrong'); } finally { setSubmitting(false); }
  };

  if (!authed) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  const inputClass = "w-full h-10 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/events" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to Events</Link>
        <h1 className="text-xl font-bold text-gray-950 mb-6">Post an event</h1>
        <div className="space-y-5">
          <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event name" maxLength={200} className={inputClass} /></div>
          <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Category *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
              <option value="">Select...</option>
              {EVENT_CATEGORIES.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
            </select></div>
          <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's this event about?" rows={4}
              className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Start date *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">End date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Start time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputClass} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">End time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Venue</label>
              <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue name" className={inputClass} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Kathmandu" className={inputClass} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Ticket price</label>
              <input type="text" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} placeholder="Free / Rs. 500" className={inputClass} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Ticket URL</label>
              <input type="text" value={form.ticketUrl} onChange={(e) => setForm({ ...form, ticketUrl: e.target.value })} placeholder="https://..." className={inputClass} /></div>
          </div>
          <ImageUpload value={form.imageUrls} onChange={(urls) => setForm({ ...form, imageUrls: urls })} max={5} label="Photos" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone</label>
              <input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+977-..." className={inputClass} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">WhatsApp</label>
              <input type="tel" value={form.contactWhatsapp} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })} placeholder="+977-..." className={inputClass} /></div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleSubmit} disabled={submitting}
            className="h-10 px-6 bg-gray-950 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post event'}
          </button>
        </div>
      </div>
    </div>
  );
}
