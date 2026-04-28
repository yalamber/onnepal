'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import { CLASSIFIED_CATEGORIES } from '@/lib/classified-categories';
import { ImageUpload } from '@/components/image-upload';

export default function NewClassifiedPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [form, setForm] = useState({
    title: '', category: '', description: '', price: '', location: '',
    contactPhone: '', contactWhatsapp: '',
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => { fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); else setAuthed(true); }); }, [router]);

  const handleSubmit = async () => {
    if (!form.title.trim() || form.title.length < 3) { setError('Title must be at least 3 characters'); return; }
    if (!form.category) { setError('Please select a category'); return; }

    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/classifieds', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(), category: form.category,
          description: form.description.trim() || null, price: form.price.trim() || null,
          location: form.location.trim() || null, contactPhone: form.contactPhone.trim() || null,
          contactWhatsapp: form.contactWhatsapp.trim() || null,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => null) as { error?: string } | null; setError(d?.error || 'Failed'); return; }
      const data = await res.json() as { id?: string; listing?: { id: string } };
      router.push(`/classifieds/post/${data.listing?.id || data.id}`);
    } catch { setError('Something went wrong'); } finally { setSubmitting(false); }
  };

  if (!authed) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  const inputClass = "w-full h-10 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/classifieds" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Classifieds</Link>
        <h1 className="text-xl font-bold text-gray-950 mb-1">Post an ad</h1>
        <p className="text-sm text-gray-400 mb-6">Sell, buy, or offer services</p>

        <div className="space-y-5">
          {/* Title — borderless */}
          <div>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What are you selling? *" maxLength={120}
              className="w-full h-12 px-0 text-lg font-semibold text-gray-950 placeholder:text-gray-300 placeholder:font-normal border-0 border-b border-gray-200 focus:outline-none focus:border-gray-950 transition-colors" />
          </div>

          {/* Category — dropdown with optgroups (too many subcategories for pills) */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Category *</p>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass}>
              <option value="">Select a category...</option>
              {CLASSIFIED_CATEGORIES.map((parent) => (
                <optgroup key={parent.slug} label={parent.name}>
                  {parent.subcategories.map((sub) => (
                    <option key={sub.slug} value={sub.name}>{sub.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Price + Location inline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Price</label>
              <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Rs. 15,000" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Kathmandu" className={inputClass} />
            </div>
          </div>

          {/* Description */}
          <div>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what you're selling..." rows={3}
              className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" />
          </div>

          {/* Expandable details */}
          {!showDetails ? (
            <button onClick={() => setShowDetails(true)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-950 cursor-pointer transition-colors">
              <ChevronDown className="h-4 w-4" /> Add photos & contact info
            </button>
          ) : (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <ImageUpload value={imageUrls} onChange={setImageUrls} max={5} label="Photos" />
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
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Post ad'}
          </button>
        </div>
      </div>
    </div>
  );
}
