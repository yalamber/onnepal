'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/lib/event-categories';
import { ImageUpload } from '@/components/image-upload';
import { DatePicker } from '@/components/date-picker';
import { TimePicker } from '@/components/time-picker';

export default function PostEventPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/events" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Events</Link>
        <h1 className="text-xl font-bold text-gray-950 mb-1">Post an event</h1>
        <p className="text-sm text-gray-400 mb-6">Share an event happening in Nepal</p>

        <div className="space-y-5">
          {/* Title — big, prominent */}
          <div>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Event name *" maxLength={200}
              className="w-full h-12 px-0 text-lg font-semibold text-gray-950 placeholder:text-gray-300 placeholder:font-normal border-0 border-b border-gray-200 focus:outline-none focus:border-gray-950 transition-colors" />
          </div>

          {/* Category as pills */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Category *</p>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_CATEGORIES.map(c => (
                <button key={c.slug} onClick={() => setForm({ ...form, category: c.name })}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                    form.category === c.name ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date + time — essential */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Date *</label>
              <DatePicker value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Time</label>
              <TimePicker value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
            </div>
          </div>

          {/* Description */}
          <div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell people about this event..." rows={3}
              className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" />
          </div>

          {/* Expandable details */}
          {!showDetails ? (
            <button onClick={() => setShowDetails(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-950 cursor-pointer transition-colors">
              <ChevronDown className="h-4 w-4" /> Add venue, photos, tickets & contact
            </button>
          ) : (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Venue</label>
                  <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue name" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Kathmandu" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">End date</label>
                  <DatePicker value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">End time</label>
                  <TimePicker value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Ticket price</label>
                  <input type="text" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} placeholder="Free / Rs. 500" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Ticket link</label>
                  <input type="text" value={form.ticketUrl} onChange={(e) => setForm({ ...form, ticketUrl: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
              </div>
              <ImageUpload value={form.imageUrls} onChange={(urls) => setForm({ ...form, imageUrls: urls })} max={5} label="Photos" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Phone</label>
                  <input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+977-..." className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">WhatsApp</label>
                  <input type="tel" value={form.contactWhatsapp} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })} placeholder="+977-..." className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button onClick={handleSubmit} disabled={submitting || !form.title.trim() || !form.category || !form.startDate}
            className="w-full h-10 bg-gray-950 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Post event'}
          </button>
        </div>
      </div>
    </div>
  );
}
