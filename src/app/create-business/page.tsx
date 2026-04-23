'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';

import { CATEGORIES } from '@/lib/categories';

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'website', label: 'Website' },
];

export default function CreateBusinessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>}>
      <CreateBusinessForm />
    </Suspense>
  );
}

function CreateBusinessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledSubdomain = searchParams.get('subdomain') || '';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [businessId, setBusinessId] = useState('');

  const [subdomain, setSubdomain] = useState(prefilledSubdomain);
  const [businessName, setBusinessName] = useState('');
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>(
    prefilledSubdomain ? 'available' : 'idle'
  );

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [links, setLinks] = useState<Array<{ platform: string; url: string }>>([
    { platform: 'facebook', url: '' },
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    };
    checkAuth();
  }, [router]);

  const checkSubdomain = useCallback(async (value: string) => {
    if (value.length < 3) { setSubdomainStatus('idle'); return; }
    setSubdomainStatus('checking');
    try {
      const res = await fetch(`/api/subdomain/check?name=${encodeURIComponent(value)}`);
      const data = await res.json() as { available?: boolean };
      setSubdomainStatus(res.ok && data.available ? 'available' : res.ok ? 'taken' : 'invalid');
    } catch { setSubdomainStatus('idle'); }
  }, []);

  useEffect(() => {
    if (!subdomain || subdomain.length < 3) return;
    const timer = setTimeout(() => checkSubdomain(subdomain), 400);
    return () => clearTimeout(timer);
  }, [subdomain, checkSubdomain]);

  const createBusiness = async () => {
    if (subdomainStatus !== 'available' || !businessName.trim()) return;
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, businessName, businessCategory: category || undefined }),
      });
      const data = await res.json() as { business?: { id: string }; id?: string; error?: string };
      if (!res.ok) { setError(data.error || 'Failed to create'); return; }
      setBusinessId(data.business?.id || data.id || '');
      setStep(2);
    } finally { setSaving(false); }
  };

  const saveDetails = async () => {
    setSaving(true);
    try {
      await fetch(`/api/business/profile?businessId=${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessCategory: category, description, phone, address }),
      });
      setStep(3);
    } finally { setSaving(false); }
  };

  const publishAndFinish = async () => {
    setSaving(true);
    try {
      const validLinks = links.filter((l) => l.url.trim());
      for (const link of validLinks) {
        await fetch(`/api/business/links?businessId=${businessId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(link),
        });
      }
      await fetch(`/api/business/publish?businessId=${businessId}`, { method: 'POST' });
      router.push('/dashboard');
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center px-4 sm:px-6 py-16">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-8 mb-10">
          {['Claim URL', 'Details', 'Links'].map((label, i) => {
            const num = i + 1;
            const active = step === num;
            const done = step > num;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  done ? 'bg-gray-950 text-white' : active ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {done ? <Check className="h-3 w-3" /> : num}
                </div>
                <span className={`text-sm ${active ? 'text-gray-950 font-medium' : 'text-gray-400'}`}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Create a business page</h1>
            <p className="mt-2 text-gray-400">Claim your free subdomain on OnNepal.</p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Business name</label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="My Business" required minLength={2} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Your page URL</label>
                <div className="flex">
                  <Input value={subdomain}
                    onChange={(e) => { const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); setSubdomain(v); if (v.length < 3) setSubdomainStatus('idle'); }}
                    placeholder="yourbusiness" maxLength={30} className="rounded-r-none" />
                  <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-sm text-gray-400 flex items-center">.onnepal.com</span>
                </div>
                <div className="h-5 mt-1">
                  {subdomainStatus === 'checking' && <span className="text-xs text-gray-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Checking...</span>}
                  {subdomainStatus === 'available' && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Available</span>}
                  {subdomainStatus === 'taken' && <span className="text-xs text-red-500">Already taken</span>}
                  {subdomainStatus === 'invalid' && <span className="text-xs text-red-500">Invalid name</span>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category <span className="text-gray-400 font-normal">(optional)</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 transition-colors">
                  <option value="">Select category</option>
                  {CATEGORIES.map((parent) => (
                    <optgroup key={parent.slug} label={parent.name}>
                      {parent.subcategories.map((sub) => (
                        <option key={sub.slug} value={sub.name}>{sub.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button onClick={createBusiness}
                disabled={saving || subdomainStatus !== 'available' || !businessName.trim()}
                className="w-full h-10 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-default transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Business details</h1>
            <p className="mt-2 text-gray-400">Tell visitors about <span className="text-gray-950 font-medium">{businessName}</span>.</p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your business do?" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977-..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Address <span className="text-gray-400 font-normal">(optional)</span></label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kathmandu" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="h-10 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={saveDetails} disabled={saving}
                  className="flex-1 h-10 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Add your links</h1>
            <p className="mt-2 text-gray-400">Connect your social profiles. You can skip this and add later.</p>

            <div className="mt-8 space-y-4">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <select value={link.platform}
                    onChange={(e) => { const u = [...links]; u[i].platform = e.target.value; setLinks(u); }}
                    className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 transition-colors">
                    {SOCIAL_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <Input value={link.url}
                    onChange={(e) => { const u = [...links]; u[i].url = e.target.value; setLinks(u); }}
                    placeholder="https://..." className="flex-1" />
                  {links.length > 1 && (
                    <button onClick={() => setLinks(links.filter((_, j) => j !== i))} className="px-2 text-gray-400 hover:text-gray-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <button onClick={() => setLinks([...links, { platform: 'facebook', url: '' }])}
                className="text-sm text-gray-400 hover:text-gray-950 transition-colors flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add another
              </button>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(2)} className="h-10 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={publishAndFinish} disabled={saving}
                  className="flex-1 h-10 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Publish <Check className="h-4 w-4" /></>}
                </button>
              </div>

              <button onClick={async () => {
                await fetch(`/api/business/publish?businessId=${businessId}`, { method: 'POST' });
                router.push('/dashboard');
              }} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors pt-2">
                Skip for now
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">&larr; Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
