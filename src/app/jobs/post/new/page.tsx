'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES } from '@/lib/job-categories';

export default function PostJobPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', company: '', category: '', type: 'full-time', description: '',
    location: '', isRemote: false, salary: '', experience: '', applyUrl: '',
    contactEmail: '', contactPhone: '',
  });

  useEffect(() => { fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); else setAuthed(true); }); }, [router]);

  const handleSubmit = async () => {
    if (!form.title.trim() || form.title.length < 3) { setError('Title must be at least 3 characters'); return; }
    if (!form.company.trim()) { setError('Company name is required'); return; }
    if (!form.category) { setError('Please select a category'); return; }

    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, description: form.description || null, location: form.location || null,
          salary: form.salary || null, experience: form.experience || null, applyUrl: form.applyUrl || null,
          contactEmail: form.contactEmail || null, contactPhone: form.contactPhone || null }),
      });
      if (!res.ok) { const d = await res.json().catch(() => null) as { error?: string } | null; setError(d?.error || 'Failed'); return; }
      const data = await res.json() as { id: string };
      router.push(`/jobs/${data.id}`);
    } catch { setError('Something went wrong'); } finally { setSubmitting(false); }
  };

  if (!authed) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  const inputClass = "w-full h-10 px-3 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/jobs" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Back to Jobs</Link>
        <h1 className="text-xl font-bold text-gray-950 mb-6">Post a job</h1>
        <div className="space-y-5">
          <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Job title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Software Engineer" maxLength={200} className={inputClass} /></div>
          <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Company *</label>
            <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" maxLength={200} className={inputClass} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                <option value="">Select...</option>
                {JOB_CATEGORIES.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Job responsibilities, requirements, benefits..." rows={6}
              className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Kathmandu" className={inputClass} /></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isRemote} onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} className="rounded" />
                <span className="text-sm text-gray-700">Remote work available</span>
              </label></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Salary</label>
              <input type="text" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Rs. 30,000 - 50,000/month" className={inputClass} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Experience</label>
              <input type="text" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="2-3 years" className={inputClass} /></div>
          </div>
          <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Apply URL</label>
            <input type="text" value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} placeholder="https://..." className={inputClass} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Contact email</label>
              <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="hr@company.com" className={inputClass} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1.5 block">Contact phone</label>
              <input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+977-..." className={inputClass} /></div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleSubmit} disabled={submitting}
            className="h-10 px-6 bg-gray-950 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post job'}
          </button>
        </div>
      </div>
    </div>
  );
}
