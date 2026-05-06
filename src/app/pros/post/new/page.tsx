'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/service-categories';
import { ImageUpload } from '@/components/image-upload';
import { CityField } from '@/components/city-field';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { PillSelector } from '@/components/pill-selector';
import { ExpandableSection } from '@/components/expandable-section';
import { SubmitButton } from '@/components/form-buttons';
import { toast } from 'sonner';

export default function PostServicePage() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', category: '', description: '', location: '', city: '',
    priceType: '', price: '', contactPhone: '', contactWhatsapp: '',
    imageUrls: [] as string[],
  });

  const handleSubmit = async () => {
    if (!form.title.trim() || form.title.length < 3) { setError('Title must be at least 3 characters'); return; }
    if (!form.category) { setError('Please select a category'); return; }

    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          category: SERVICE_CATEGORIES.find(c => c.slug === form.category)?.name || form.category,
          description: form.description.trim() || null,
          location: form.location || null, city: form.city || null,
          priceType: form.priceType || null,
          price: form.price || null,
          contactPhone: form.contactPhone || null,
          contactWhatsapp: form.contactWhatsapp || null,
          imageUrls: form.imageUrls.length > 0 ? form.imageUrls : undefined,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => null) as { error?: string } | null; setError(d?.error || 'Failed'); toast.error(d?.error || 'Failed to post'); return; }
      const data = await res.json() as { id: string };
      toast.success('Listed successfully');
      router.push(`/pros/${data.id}`);
    } catch { setError('Something went wrong'); toast.error('Something went wrong'); } finally { setSubmitting(false); }
  };

  if (!ready) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  const inputClass = "w-full h-10 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/pros" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Services</Link>
        <h1 className="text-xl font-bold text-gray-950 mb-1">List your service</h1>
        <p className="text-sm text-gray-400 mb-6">Help people find you for the work you do</p>

        <div className="space-y-5">
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Service title *" maxLength={200}
            className="w-full h-12 px-0 text-lg font-semibold text-gray-950 placeholder:text-gray-300 placeholder:font-normal border-0 border-b border-gray-200 focus:outline-none focus:border-gray-950 transition-colors" />

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Category *</p>
            <PillSelector options={SERVICE_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          </div>

          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your service, experience, and what you offer..."
            rows={4}
            className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Pricing</label>
              <select value={form.priceType} onChange={(e) => setForm({ ...form, priceType: e.target.value })}
                className={inputClass}>
                <option value="">Select type</option>
                <option value="fixed">Fixed price</option>
                <option value="hourly">Hourly rate</option>
                <option value="negotiable">Negotiable</option>
                <option value="free">Free</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Price (Rs.)</label>
              <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="500" className={inputClass} />
            </div>
          </div>

          <div>
            <div className="mb-4">
              <CityField value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            </div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Service area <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Kathmandu valley, Pokhara, remote…" className={inputClass} />
          </div>

          <ExpandableSection label="Add photos & contact info">
            <div className="space-y-4">
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

          <SubmitButton submitting={submitting} label="List service" disabled={!form.title.trim() || !form.category} onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
