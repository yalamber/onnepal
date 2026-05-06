'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES } from '@/lib/job-categories';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { PillSelector } from '@/components/pill-selector';
import { CityField } from '@/components/city-field';
import { ExpandableSection } from '@/components/expandable-section';
import { SubmitButton } from '@/components/form-buttons';
import { toast } from 'sonner';

export default function PostJobPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', company: '', category: '', type: 'full-time', description: '',
    location: '', city: '', isRemote: false, salary: '', experience: '', applyUrl: '',
    contactEmail: '', contactPhone: '',
  });

  const handleSubmit = async () => {
    if (!form.title.trim() || form.title.length < 3) { setError('Title must be at least 3 characters'); return; }
    if (!form.company.trim()) { setError('Company name is required'); return; }
    if (!form.category) { setError('Please select a category'); return; }

    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, description: form.description || null, location: form.location || null, city: form.city || null,
          salary: form.salary || null, experience: form.experience || null, applyUrl: form.applyUrl || null,
          contactEmail: form.contactEmail || null, contactPhone: form.contactPhone || null }),
      });
      if (!res.ok) { const d = await res.json().catch(() => null) as { error?: string } | null; setError(d?.error || 'Failed'); toast.error(d?.error || 'Failed to post'); return; }
      const data = await res.json() as { id: string };
      toast.success('Posted successfully');
      router.push(`/jobs/${data.id}`);
    } catch { setError('Something went wrong'); toast.error('Something went wrong'); } finally { setSubmitting(false); }
  };

  if (!ready) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  const inputClass = "w-full h-10 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/jobs" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Jobs</Link>
        <h1 className="text-xl font-bold text-gray-950 mb-1">Post a job</h1>
        <p className="text-sm text-gray-400 mb-6">Find your next team member</p>

        <div className="space-y-5">
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Job title *" maxLength={200}
            className="w-full h-12 px-0 text-lg font-semibold text-gray-950 placeholder:text-gray-300 placeholder:font-normal border-0 border-b border-gray-200 focus:outline-none focus:border-gray-950 transition-colors" />

          <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Company name *" maxLength={200}
            className="w-full h-10 px-0 text-sm text-gray-950 placeholder:text-gray-300 border-0 border-b border-gray-100 focus:outline-none focus:border-gray-400 transition-colors" />

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Type *</p>
            <PillSelector options={JOB_TYPES.map(t => ({ name: t.label, slug: t.value }))} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Category *</p>
            <PillSelector options={JOB_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          </div>

          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the role, requirements, and benefits..." rows={4}
            className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" />

          <ExpandableSection label="Add salary, location, apply link & contact">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-4">
              <CityField value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            </div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Neighborhood / area <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Pulchowk, Naxal, Jawalakhel…" className={inputClass} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isRemote} onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} className="rounded" />
                    <span className="text-sm text-gray-600">Remote OK</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Salary</label>
                  <input type="text" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Rs. 30-50k/mo" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Experience</label>
                  <input type="text" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="2-3 years" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Apply URL</label>
                <input type="text" value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} placeholder="https://..." className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Contact email</label>
                  <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="hr@company.com" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Phone</label>
                  <input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+977-..." className={inputClass} />
                </div>
              </div>
            </div>
          </ExpandableSection>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <SubmitButton submitting={submitting} label="Post job" disabled={!form.title.trim() || !form.company.trim() || !form.category} onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
