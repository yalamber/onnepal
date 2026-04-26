'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { LOST_FOUND_CATEGORIES } from '@/lib/lost-found-categories';
import { ImageUpload } from '@/components/image-upload';
import { DatePicker } from '@/components/date-picker';

export default function PostLostFoundPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [form, setForm] = useState({
    type: 'lost' as 'lost' | 'found',
    title: '', category: '', description: '', location: '', itemDate: '',
    reward: '', contactPhone: '', contactWhatsapp: '', imageUrls: [] as string[],
  });

  useEffect(() => { fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); else setAuthed(true); }); }, [router]);

  const handleSubmit = async () => {
    if (!form.title.trim() || form.title.length < 3) { setError('Title must be at least 3 characters'); return; }
    if (!form.category) { setError('Please select a category'); return; }

    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/lost-found', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, description: form.description || null, location: form.location || null,
          itemDate: form.itemDate || null, reward: form.reward || null, contactPhone: form.contactPhone || null,
          contactWhatsapp: form.contactWhatsapp || null, imageUrls: form.imageUrls.length > 0 ? form.imageUrls : undefined }),
      });
      if (!res.ok) { const d = await res.json().catch(() => null) as { error?: string } | null; setError(d?.error || 'Failed'); return; }
      const data = await res.json() as { id: string };
      router.push(`/lost-found/post/${data.id}`);
    } catch { setError('Something went wrong'); } finally { setSubmitting(false); }
  };

  if (!authed) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  const inputClass = "w-full h-10 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/lost-found" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Lost & Found</Link>
        <h1 className="text-xl font-bold text-gray-950 mb-1">Report an item</h1>
        <p className="text-sm text-gray-400 mb-6">Help reunite lost items with their owners</p>

        <div className="space-y-5">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(['lost', 'found'] as const).map((t) => (
              <button key={t} onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  form.type === t
                    ? t === 'lost' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}>
                {t === 'lost' ? 'I lost something' : 'I found something'}
              </button>
            ))}
          </div>

          {/* Title — borderless */}
          <div>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={form.type === 'lost' ? 'What did you lose? *' : 'What did you find? *'}
              maxLength={120}
              className="w-full h-12 px-0 text-lg font-semibold text-gray-950 placeholder:text-gray-300 placeholder:font-normal border-0 border-b border-gray-200 focus:outline-none focus:border-gray-950 transition-colors" />
          </div>

          {/* Category as pills */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Category *</p>
            <div className="flex flex-wrap gap-1.5">
              {LOST_FOUND_CATEGORIES.map(c => (
                <button key={c.slug} onClick={() => setForm({ ...form, category: c.name })}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                    form.category === c.name ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Location + Date inline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Kathmandu, Thamel" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Date {form.type === 'lost' ? 'lost' : 'found'}</label>
              <DatePicker value={form.itemDate} onChange={(v) => setForm({ ...form, itemDate: v })} />
            </div>
          </div>

          {/* Description */}
          <div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the item, identifying features, circumstances..."
              rows={3} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" />
          </div>

          {/* Expandable details */}
          {!showDetails ? (
            <button onClick={() => setShowDetails(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-950 cursor-pointer transition-colors">
              <ChevronDown className="h-4 w-4" /> Add photos, reward & contact info
            </button>
          ) : (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              {form.type === 'lost' && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Reward</label>
                  <input type="text" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })}
                    placeholder="Rs. 5,000" className={inputClass} />
                </div>
              )}
              <ImageUpload value={form.imageUrls} onChange={(urls) => setForm({ ...form, imageUrls: urls })} max={5} label="Photos" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Phone</label>
                  <input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="+977-..." className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">WhatsApp</label>
                  <input type="tel" value={form.contactWhatsapp} onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
                    placeholder="+977-..." className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button onClick={handleSubmit} disabled={submitting || !form.title.trim() || !form.category}
            className="w-full h-10 bg-gray-950 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Post item'}
          </button>
        </div>
      </div>
    </div>
  );
}
