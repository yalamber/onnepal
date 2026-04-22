'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ArrowLeft, Check, Plus, Trash2, Building2 } from 'lucide-react';

const CATEGORIES = [
  'Restaurant & Cafe', 'Retail Shop', 'Beauty & Salon', 'Hotel & Travel',
  'Education', 'Health & Fitness', 'Technology', 'Construction',
  'Agriculture', 'Fashion', 'Photography', 'Other',
];

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'viber', label: 'Viber' },
  { value: 'website', label: 'Website' },
  { value: 'twitter', label: 'Twitter / X' },
];

export default function CreateBusinessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>}>
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
  const [businessId, setBusinessId] = useState('');

  // Step 1: Claim subdomain
  const [subdomain, setSubdomain] = useState(prefilledSubdomain);
  const [businessName, setBusinessName] = useState('');
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>(
    prefilledSubdomain ? 'available' : 'idle'
  );

  // Step 2: Business details
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step 3: Links
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
    setSaving(true);
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, businessName, businessCategory: category || undefined }),
      });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok) { alert(data.error || 'Failed to create'); return; }
      setBusinessId(data.id!);
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center justify-center gap-1.5 mb-10">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${
                s <= step ? 'bg-indigo-600 w-10' : 'bg-slate-200 w-6'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Claim subdomain */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950 tracking-tight">Create your business</h2>
                <p className="text-slate-500 text-sm">Claim your free subdomain</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700">Business name</Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="My Business"
                  required
                  minLength={2}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-slate-700">Your page URL</Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    value={subdomain}
                    onChange={(e) => {
                      const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setSubdomain(v);
                      if (v.length < 3) setSubdomainStatus('idle');
                    }}
                    placeholder="yourbusiness"
                    maxLength={30}
                    className="rounded-r-none"
                  />
                  <span className="px-3 py-2 bg-slate-50 border border-l-0 border-slate-200 rounded-r-lg text-sm text-slate-400 h-10 flex items-center">
                    .onnepal.com
                  </span>
                </div>
                <div className="h-5 mt-1.5">
                  {subdomainStatus === 'checking' && <span className="text-xs text-slate-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Checking...</span>}
                  {subdomainStatus === 'available' && <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Available</span>}
                  {subdomainStatus === 'taken' && <span className="text-xs text-red-500">Already taken</span>}
                  {subdomainStatus === 'invalid' && <span className="text-xs text-red-500">Invalid name</span>}
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Category (optional)</Label>
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat === category ? '' : cat)}
                      className={`px-3 py-2 text-xs rounded-lg border transition-all duration-150 ${
                        category === cat
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={createBusiness}
                disabled={saving || subdomainStatus !== 'available' || !businessName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create business <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-slate-950 tracking-tight mb-1">Business Details</h2>
            <p className="text-slate-500 text-sm mb-6">Tell visitors about your business</p>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700">Description (optional)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your business do?" maxLength={500} rows={3} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-slate-700">Phone (optional)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977-..." className="mt-1.5" />
              </div>
              <div>
                <Label className="text-slate-700">Address (optional)</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kathmandu, Nepal" className="mt-1.5" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                <Button onClick={saveDetails} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next <ArrowRight className="h-4 w-4 ml-1" /></>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Links */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-slate-950 tracking-tight mb-1">Add Your Links</h2>
            <p className="text-slate-500 text-sm mb-6">Connect your social profiles</p>

            <div className="space-y-4">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select
                    value={link.platform}
                    onChange={(e) => { const u = [...links]; u[i].platform = e.target.value; setLinks(u); }}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:border-indigo-400 outline-none"
                  >
                    {SOCIAL_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <Input
                    value={link.url}
                    onChange={(e) => { const u = [...links]; u[i].url = e.target.value; setLinks(u); }}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  {links.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setLinks(links.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={() => setLinks([...links, { platform: 'facebook', url: '' }])}>
                <Plus className="h-4 w-4 mr-1" /> Add another
              </Button>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
                <Button onClick={publishAndFinish} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Publish <Check className="h-4 w-4 ml-1" /></>}
                </Button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await fetch(`/api/business/publish?businessId=${businessId}`, { method: 'POST' });
                  router.push('/dashboard');
                }}
                className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
