'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Facebook, Instagram, MessageCircle, Globe,
  ExternalLink, ArrowRight, Plus, X, Loader2, Check,
} from 'lucide-react';

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', placeholder: 'facebook.com/yourbusiness' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', placeholder: 'instagram.com/yourbusiness' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50', placeholder: '+977 98...' },
  { value: 'tiktok', label: 'TikTok', icon: Globe, color: 'text-slate-800', bg: 'bg-slate-100', placeholder: 'tiktok.com/@you' },
  { value: 'website', label: 'Website', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50', placeholder: 'yourwebsite.com' },
];

interface PageData {
  subdomain: string;
  businessName: string;
  category: string;
  links: Array<{ platform: string; url: string }>;
}

/* ── The Preview ── */
function Preview({ data }: { data: PageData }) {
  const activeLinks = data.links.filter(l => l.url.trim());

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-full max-w-[340px]">
      {/* Cover */}
      <div className="h-28 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700" />

      <div className="px-6 pb-6 -mt-8 relative">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100">
          {data.businessName ? data.businessName.charAt(0).toUpperCase() : 'O'}
        </div>

        <h2 className="mt-3 text-lg font-bold text-slate-900 truncate">
          {data.businessName || 'Your Business'}
        </h2>
        {data.category && (
          <p className="text-sm text-slate-500 mt-0.5">{data.category}</p>
        )}

        {/* Links */}
        {activeLinks.length > 0 && (
          <div className="mt-5 space-y-2">
            {activeLinks.map((link, i) => {
              const p = PLATFORMS.find(pl => pl.value === link.platform);
              const Icon = p?.icon || Globe;
              return (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${p?.bg || 'bg-slate-50'} transition-all`}>
                  <Icon className={`h-5 w-5 ${p?.color || 'text-slate-500'}`} />
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {p?.label || link.platform}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-300 ml-auto flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {activeLinks.length === 0 && (
          <div className="mt-6 mb-2 text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 mx-auto mb-3 flex items-center justify-center">
              <Globe className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">Your links will appear here</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50">
        <p className="text-xs text-center font-mono text-slate-400">
          {data.subdomain || 'yourbusiness'}.onnepal.com
        </p>
      </div>
    </div>
  );
}

/* ── Step indicator ── */
function Steps({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            s < current ? 'bg-emerald-500 text-white'
            : s === current ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-400'
          }`}>
            {s < current ? <Check className="h-4 w-4" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-8 h-px transition-colors duration-300 ${s < current ? 'bg-emerald-300' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const [data, setData] = useState<PageData>({
    subdomain: '',
    businessName: '',
    category: '',
    links: [{ platform: 'facebook', url: '' }],
  });

  // Subdomain check
  const checkSubdomain = useCallback(async (name: string) => {
    if (name.length < 3) { setSubdomainStatus('idle'); return; }
    setSubdomainStatus('checking');
    try {
      const res = await fetch(`/api/subdomain/check?name=${encodeURIComponent(name)}`);
      const d = await res.json() as { available?: boolean };
      setSubdomainStatus(res.ok && d.available ? 'available' : 'taken');
    } catch { setSubdomainStatus('idle'); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (data.subdomain.length >= 3) checkSubdomain(data.subdomain); }, 400);
    return () => clearTimeout(t);
  }, [data.subdomain, checkSubdomain]);

  const handleSubdomain = (v: string) => {
    setData(d => ({ ...d, subdomain: v.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
  };

  const updateLink = (i: number, field: 'platform' | 'url', value: string) => {
    setData(d => {
      const links = [...d.links];
      links[i] = { ...links[i], [field]: value };
      return { ...d, links };
    });
  };

  const canProceed1 = subdomainStatus === 'available' && data.businessName.length >= 2;
  const canProceed2 = true; // links are optional

  const handleClaim = () => {
    router.push(`/signup?subdomain=${encodeURIComponent(data.subdomain)}&name=${encodeURIComponent(data.businessName)}`);
  };

  return (
    <main className="min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-6 py-8 sm:py-14">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Create your page
            </h1>
            <p className="text-slate-500 mt-1">
              {step === 1 && 'Start with your business name'}
              {step === 2 && 'Add your social links'}
              {step === 3 && 'Your page is ready'}
            </p>
          </div>
          <Steps current={step} />
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Left: Form ── */}
          <div>
            {/* Step 1: Business info */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                  <div>
                    <Label className="text-slate-900 font-semibold">Business name</Label>
                    <Input
                      value={data.businessName}
                      onChange={e => setData(d => ({ ...d, businessName: e.target.value }))}
                      placeholder="e.g. Himalayan Bites"
                      className="mt-2 text-base h-12"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label className="text-slate-900 font-semibold">Page address</Label>
                    <div className="flex items-center mt-2">
                      <Input
                        value={data.subdomain}
                        onChange={e => handleSubdomain(e.target.value)}
                        placeholder="himalayanbites"
                        maxLength={30}
                        className="rounded-r-none h-12 text-base font-mono"
                      />
                      <span className="px-4 h-12 flex items-center bg-slate-50 border border-l-0 border-slate-200 rounded-r-xl text-sm text-slate-400 whitespace-nowrap">
                        .onnepal.com
                      </span>
                    </div>
                    <div className="h-5 mt-1.5">
                      {subdomainStatus === 'checking' && <span className="text-xs text-slate-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Checking</span>}
                      {subdomainStatus === 'available' && <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Available!</span>}
                      {subdomainStatus === 'taken' && <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> Already taken</span>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-900 font-semibold">Category <span className="font-normal text-slate-400">(optional)</span></Label>
                    <Input
                      value={data.category}
                      onChange={e => setData(d => ({ ...d, category: e.target.value }))}
                      placeholder="Restaurant, Salon, Travel..."
                      className="mt-2 h-12"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceed1}
                  size="lg"
                  className="w-full text-base h-12"
                >
                  Continue <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Step 2: Links */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                  <p className="text-sm text-slate-500">Where can customers find you online?</p>

                  {data.links.map((link, i) => {
                    const p = PLATFORMS.find(pl => pl.value === link.platform);
                    return (
                      <div key={i} className="flex gap-2">
                        <select
                          value={link.platform}
                          onChange={e => updateLink(i, 'platform', e.target.value)}
                          className="h-12 px-3 border border-slate-200 rounded-xl text-sm bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        >
                          {PLATFORMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <Input
                          value={link.url}
                          onChange={e => updateLink(i, 'url', e.target.value)}
                          placeholder={p?.placeholder}
                          className="flex-1 h-12"
                        />
                        {data.links.length > 1 && (
                          <button
                            onClick={() => setData(d => ({ ...d, links: d.links.filter((_, idx) => idx !== i) }))}
                            className="h-12 w-12 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setData(d => ({ ...d, links: [...d.links, { platform: 'instagram', url: '' }] }))}
                    className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors py-1"
                  >
                    <Plus className="h-4 w-4" /> Add another link
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} size="lg" className="h-12">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} size="lg" className="flex-1 text-base h-12">
                    Continue <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Check className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Looking good!</p>
                      <p className="text-sm text-slate-500">Here&apos;s a preview of your page.</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Address</span>
                      <span className="font-mono font-medium text-slate-900">{data.subdomain}.onnepal.com</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Business</span>
                      <span className="font-medium text-slate-900">{data.businessName}</span>
                    </div>
                    {data.category && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Category</span>
                        <span className="text-slate-900">{data.category}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Links</span>
                      <span className="text-slate-900">{data.links.filter(l => l.url).length} added</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} size="lg" className="h-12">
                    Back
                  </Button>
                  <Button onClick={handleClaim} size="lg" className="flex-1 text-base h-12 bg-emerald-600 hover:bg-emerald-700">
                    Claim my page <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  Free forever. You&apos;ll create an account on the next step.
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Preview ── */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Preview data={data} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
