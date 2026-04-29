'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PLACE_CATEGORIES } from '@/lib/place-categories';
import { ImageUpload } from '@/components/image-upload';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { PillSelector } from '@/components/pill-selector';
import { ExpandableSection } from '@/components/expandable-section';
import { SubmitButton } from '@/components/form-buttons';
import { DistrictSelector } from '@/components/district-selector';

export default function PostPlacePage() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', category: '', description: '', location: '', district: '', address: '',
    website: '', contactPhone: '', contactWhatsapp: '',
    imageUrls: [] as string[],
  });

  const handleSubmit = async () => {
    if (!form.title.trim() || form.title.length < 3) { setError('Title must be at least 3 characters'); return; }
    if (!form.category) { setError('Please select a category'); return; }

    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/places', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, description: form.description || null,
          location: form.location || null, district: form.district || null,
          address: form.address || null, website: form.website || null,
          contactPhone: form.contactPhone || null, contactWhatsapp: form.contactWhatsapp || null,
          imageUrls: form.imageUrls.length > 0 ? form.imageUrls : undefined }),
      });
      if (!res.ok) { const d = await res.json().catch(() => null) as { error?: string } | null; setError(d?.error || 'Failed'); return; }
      const data = await res.json() as { id: string };
      router.push(`/places/${data.id}`);
    } catch { setError('Something went wrong'); } finally { setSubmitting(false); }
  };

  if (!ready) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  const inputClass = "w-full h-10 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/places" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Places</Link>
        <h1 className="text-xl font-bold text-gray-950 mb-1">Add a place</h1>
        <p className="text-sm text-gray-400 mb-6">Share a hidden gem in Nepal</p>

        <div className="space-y-5">
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Place name *" maxLength={200}
            className="w-full h-12 px-0 text-lg font-semibold text-gray-950 placeholder:text-gray-300 placeholder:font-normal border-0 border-b border-gray-200 focus:outline-none focus:border-gray-950 transition-colors" />

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Category *</p>
            <PillSelector options={PLACE_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          </div>

          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Tell people about this place..." rows={3}
            className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Kathmandu" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">District</label>
              <DistrictSelector value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
            </div>
          </div>

          <ExpandableSection label="Add address, photos, website & contact">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Website</label>
                <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className={inputClass} />
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
          </ExpandableSection>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <SubmitButton submitting={submitting} label="Add place" disabled={!form.title.trim() || !form.category} />
        </div>
      </div>
    </div>
  );
}
