'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { MarkdownEditor } from '@/components/markdown-editor';
import { CityField } from '@/components/city-field';

const CATEGORIES = ['Food', 'Neighborhood', 'Opinion', 'Guide', 'Festival', 'Trail', 'Family', 'Other'];

export default function NewVoicePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setLoggedIn(!!d); setAuthChecked(true); })
      .catch(() => setAuthChecked(true));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 4) { setError('Title needs at least 4 characters.'); return; }
    if (content.trim().length < 40) { setError('Body needs at least 40 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || null,
          content,
          category: category || null,
          city: city.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(j.error || `Submit failed (${res.status})`);
      }
      const j = (await res.json()) as { slug: string };
      router.push(`/voices?submitted=${j.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return <div className="page-shell py-24 text-center"><Loader2 className="h-5 w-5 animate-spin inline text-[var(--ink-400)]" /></div>;
  }
  if (!loggedIn) {
    return (
      <main className="page-hero">
        <h1 className="page-hero-title">Sign in to <em>write.</em></h1>
        <p className="page-hero-sub">Voices is for verified neighbors. <Link href="/login" className="text-[var(--accent)] underline underline-offset-4">Log in</Link> or <Link href="/signup" className="text-[var(--accent)] underline underline-offset-4">create an account</Link> to publish.</p>
      </main>
    );
  }

  return (
    <main>
      <div className="page-hero">
        <div className="t-eyebrow"><span className="dot" /> New voice</div>
        <h1 className="page-hero-title">Write a <em>voice.</em></h1>
        <p className="page-hero-sub">
          Long or short. Personal. Specific. Your editor will review before it goes live &mdash;
          and the best of the week gets featured on the homepage.
        </p>
      </div>

      <form onSubmit={submit} className="page-shell pb-24 max-w-3xl mx-auto space-y-6">
        <div>
          <label htmlFor="title" className="t-meta block mb-2">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A walk through Patan after the rain"
            className="w-full h-12 px-4 rounded-[var(--r-sm)] border border-[var(--ink-200)] bg-[var(--paper)] text-[var(--ink-900)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            required
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="t-meta block mb-2">Excerpt <span className="opacity-50">(optional, shown on cards)</span></label>
          <input
            id="excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="One line that makes someone want to read it."
            className="w-full h-12 px-4 rounded-[var(--r-sm)] border border-[var(--ink-200)] bg-[var(--paper)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            maxLength={280}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="t-meta block mb-2">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 px-4 rounded-[var(--r-sm)] border border-[var(--ink-200)] bg-[var(--paper)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            >
              <option value="">Choose…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <CityField
            value={city}
            onChange={setCity}
            label="City (optional)"
            hint="Tag this voice to a city if it's specific to one. Leave blank for national pieces."
          />
        </div>

        <div>
          <label className="t-meta block mb-2">Body (markdown supported)</label>
          <MarkdownEditor value={content} onChange={setContent} placeholder="Tell the story…" rows={14} />
        </div>

        {error && <p className="text-sm text-[var(--crimson-700)]">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Submit for review'}
          </button>
          <Link href="/voices" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </main>
  );
}
