'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { DISCUSSION_CATEGORIES } from '@/lib/discussion-categories';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { PillSelector } from '@/components/pill-selector';
import { SubmitButton } from '@/components/form-buttons';
import { CityField } from '@/components/city-field';
import { toast } from 'sonner';

export default function NewDiscussionPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', category: '', content: '', city: '' });

  const handleSubmit = async () => {
    if (!form.title.trim() || form.title.length < 3) { setError('Title must be at least 3 characters'); return; }
    if (!form.category) { setError('Please select a category'); return; }

    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/discussions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title.trim(), category: DISCUSSION_CATEGORIES.find(c => c.slug === form.category)?.name || form.category, content: form.content.trim() || null, city: form.city || null }),
      });
      if (!res.ok) { const d = await res.json().catch(() => null) as { error?: string } | null; setError(d?.error || 'Failed'); toast.error(d?.error || 'Failed to post'); return; }
      const data = await res.json() as { id: string };
      toast.success('Discussion posted');
      router.push(`/discussions/${data.id}`);
    } catch { setError('Something went wrong'); toast.error('Something went wrong'); } finally { setSubmitting(false); }
  };

  if (!ready) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/discussions" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6"><ArrowLeft className="h-4 w-4" /> Discussions</Link>
        <h1 className="text-xl font-bold text-gray-950 mb-1">Start a discussion</h1>
        <p className="text-sm text-gray-400 mb-6">Ask a question, share a tip, or start a conversation</p>

        <div className="space-y-5">
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What's on your mind? *" maxLength={200}
            className="w-full h-12 px-0 text-lg font-semibold text-gray-950 placeholder:text-gray-300 placeholder:font-normal border-0 border-b border-gray-200 focus:outline-none focus:border-gray-950 transition-colors" />

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Topic *</p>
            <PillSelector options={DISCUSSION_CATEGORIES} value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          </div>

          <CityField
            value={form.city}
            onChange={(v) => setForm({ ...form, city: v })}
            label="City (optional)"
            hint="Tag this thread to a city if it's local. Skip for national topics."
            autofillFromCookie={false}
          />

          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Add more details (optional)..."
            rows={6}
            className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <SubmitButton submitting={submitting} label="Post discussion" disabled={!form.title.trim() || !form.category} onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
