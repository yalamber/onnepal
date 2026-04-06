'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { THEME_PALETTES, DEFAULT_PALETTE, type ThemePalette } from '@/lib/themes';
import {
  Facebook, Instagram, MessageCircle, Globe,
  ExternalLink, ArrowRight, Plus, X, Loader2, Check, Pencil,
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
  theme: ThemePalette;
  links: Array<{ platform: string; url: string }>;
}

type ActiveSection = 'name' | 'address' | 'style' | 'links' | null;

/* ─── Collapsed summary row ─── */
function SummaryRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Check className="h-3 w-3 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
        </div>
      </div>
      <Pencil className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
    </button>
  );
}

/* ─── Live Preview ─── */
function Preview({ data, className = '' }: { data: PageData; className?: string }) {
  const activeLinks = data.links.filter(l => l.url.trim());
  const { primary, accent } = data.theme;

  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden transition-all duration-500">
        <div className="h-28 sm:h-32 transition-all duration-500" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }} />
        <div className="px-5 pb-5 -mt-7 relative">
          <div
            className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
          >
            {data.businessName ? data.businessName.charAt(0).toUpperCase() : 'O'}
          </div>
          <h2 className="mt-3 text-lg font-bold text-slate-900 truncate">{data.businessName || 'Your Business'}</h2>
          <p className="text-sm text-slate-400">{data.category || 'Your category'}</p>
          <button className="w-full mt-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-500" style={{ backgroundColor: primary }}>
            Contact us
          </button>
          {activeLinks.length > 0 ? (
            <div className="mt-4 space-y-1.5">
              {activeLinks.map((link, i) => {
                const p = PLATFORMS.find(pl => pl.value === link.platform);
                const Icon = p?.icon || Globe;
                return (
                  <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50">
                    <Icon className={`h-4 w-4 ${p?.color || 'text-slate-500'}`} />
                    <span className="text-sm font-medium text-slate-700 truncate">{p?.label || link.platform}</span>
                    <ExternalLink className="h-3 w-3 text-slate-300 ml-auto flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 py-8 text-center">
              <p className="text-sm text-slate-300">Your links will appear here</p>
            </div>
          )}
        </div>
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100">
          <p className="text-xs text-center font-mono text-slate-400">{data.subdomain || 'yourbusiness'}.onnepal.com</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [active, setActive] = useState<ActiveSection>('name');
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const [data, setData] = useState<PageData>({
    subdomain: '',
    businessName: '',
    category: '',
    theme: DEFAULT_PALETTE,
    links: [{ platform: 'facebook', url: '' }],
  });

  // Which sections are "done" (have been filled and moved past)
  const nameDone = data.businessName.length >= 2 && active !== 'name';
  const addressDone = data.subdomain.length >= 3 && subdomainStatus === 'available' && active !== 'address';
  const styleDone = active !== 'style' && (nameDone || addressDone);

  // Auto-advance logic
  const canAdvanceFromName = data.businessName.length >= 2;
  const canAdvanceFromAddress = subdomainStatus === 'available';
  const canClaim = subdomainStatus === 'available' && data.businessName.length >= 2;

  // Subdomain check
  const checkSubdomain = useCallback(async (name: string) => {
    if (name.length < 3) { setSubdomainStatus('idle'); return; }
    setSubdomainStatus('checking');
    try {
      const res = await fetch(`/api/subdomain/check?name=${encodeURIComponent(name)}`);
      if (!res.ok) { setSubdomainStatus('idle'); return; }
      const d = await res.json() as { available?: boolean };
      setSubdomainStatus(d.available ? 'available' : 'taken');
    } catch { setSubdomainStatus('idle'); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (data.subdomain.length >= 3) checkSubdomain(data.subdomain); }, 400);
    return () => clearTimeout(t);
  }, [data.subdomain, checkSubdomain]);

  const updateLink = (i: number, field: 'platform' | 'url', value: string) => {
    setData(d => {
      const links = [...d.links];
      links[i] = { ...links[i], [field]: value };
      return { ...d, links };
    });
  };

  const advance = (from: ActiveSection) => {
    if (from === 'name') setActive('address');
    else if (from === 'address') setActive('style');
    else if (from === 'style') setActive('links');
    else setActive(null);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="pt-20 pb-8 sm:pt-24 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Create a page for <br className="sm:hidden" />your business
          </h1>
          <p className="mt-3 text-slate-500 text-base sm:text-lg">
            A free mini website with your own <span className="font-mono text-sm text-slate-600">.onnepal.com</span> address.
          </p>
        </div>
      </div>

      {/* Builder */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-14 items-start">

          {/* ─── Left: Form ─── */}
          <div className="lg:col-span-3 max-w-lg space-y-3">

            {/* ── 1. Business Name ── */}
            {active === 'name' ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  What&apos;s your business called?
                </label>
                <Input
                  value={data.businessName}
                  onChange={e => setData(d => ({ ...d, businessName: e.target.value }))}
                  placeholder="e.g. Himalayan Bites"
                  className="h-12 text-base"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter' && canAdvanceFromName) advance('name'); }}
                />
                <div className="flex justify-end mt-3">
                  <Button
                    onClick={() => advance('name')}
                    disabled={!canAdvanceFromName}
                    size="sm"
                  >
                    Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ) : nameDone ? (
              <SummaryRow
                label="Business name"
                value={data.businessName}
                onClick={() => setActive('name')}
              />
            ) : null}

            {/* ── 2. Address ── */}
            {active === 'address' ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Choose your page address
                </label>
                <div className="flex">
                  <Input
                    value={data.subdomain}
                    onChange={e => setData(d => ({ ...d, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder={data.businessName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'yourbusiness'}
                    maxLength={30}
                    className="rounded-r-none h-12 text-base font-mono"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter' && canAdvanceFromAddress) advance('address'); }}
                  />
                  <span className="px-3 h-12 flex items-center bg-slate-50 border border-l-0 border-slate-200 rounded-r-xl text-sm text-slate-400 whitespace-nowrap">
                    .onnepal.com
                  </span>
                </div>
                <div className="h-5 mt-1">
                  {subdomainStatus === 'checking' && <span className="text-xs text-slate-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Checking</span>}
                  {subdomainStatus === 'available' && <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Available</span>}
                  {subdomainStatus === 'taken' && <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> Taken — try another</span>}
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={() => advance('address')}
                    disabled={!canAdvanceFromAddress}
                    size="sm"
                  >
                    Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ) : addressDone ? (
              <SummaryRow
                label="Page address"
                value={`${data.subdomain}.onnepal.com`}
                onClick={() => setActive('address')}
              />
            ) : null}

            {/* ── 3. Style (Category + Theme) ── */}
            {active === 'style' ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    What kind of business? <span className="font-normal text-slate-400">optional</span>
                  </label>
                  <Input
                    value={data.category}
                    onChange={e => setData(d => ({ ...d, category: e.target.value }))}
                    placeholder="Restaurant, Salon, Travel..."
                    className="h-11"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2.5">
                    Pick a color theme
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {THEME_PALETTES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setData(d => ({ ...d, theme: t }))}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 ${
                          data.theme.id === t.id
                            ? 'bg-slate-100 ring-2 ring-slate-900 ring-offset-1'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex gap-0.5">
                          {t.preview.map((color, i) => (
                            <div key={i} className={`w-5 h-5 sm:w-6 sm:h-6 ${i === 0 ? 'rounded-l-md' : ''} ${i === 2 ? 'rounded-r-md' : ''}`} style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <span className={`text-[0.6rem] font-medium ${data.theme.id === t.id ? 'text-slate-900' : 'text-slate-400'}`}>{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => advance('style')} size="sm">
                    Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ) : styleDone && (nameDone && addressDone) ? (
              <SummaryRow
                label="Style"
                value={`${data.theme.name} theme${data.category ? ` · ${data.category}` : ''}`}
                onClick={() => setActive('style')}
              />
            ) : null}

            {/* ── 4. Links ── */}
            {active === 'links' ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-fade-in space-y-4">
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-medium text-slate-900">Add your links</label>
                  <span className="text-xs text-slate-400">you can skip this</span>
                </div>

                <div className="space-y-2">
                  {data.links.map((link, i) => {
                    const p = PLATFORMS.find(pl => pl.value === link.platform);
                    return (
                      <div key={i} className="flex gap-2">
                        <select
                          value={link.platform}
                          onChange={e => updateLink(i, 'platform', e.target.value)}
                          className="h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        >
                          {PLATFORMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <Input
                          value={link.url}
                          onChange={e => updateLink(i, 'url', e.target.value)}
                          placeholder={p?.placeholder}
                          className="flex-1 h-11"
                        />
                        {data.links.length > 1 && (
                          <button
                            onClick={() => setData(d => ({ ...d, links: d.links.filter((_, idx) => idx !== i) }))}
                            className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {data.links.length < 5 && (
                  <button
                    onClick={() => setData(d => ({ ...d, links: [...d.links, { platform: 'instagram', url: '' }] }))}
                    className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add another
                  </button>
                )}

                <div className="pt-2">
                  <Button
                    onClick={() => router.push(`/signup?subdomain=${encodeURIComponent(data.subdomain)}&name=${encodeURIComponent(data.businessName)}`)}
                    disabled={!canClaim}
                    size="lg"
                    className="w-full h-12 text-base"
                  >
                    Create {data.subdomain}.onnepal.com <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    Free forever &middot; No credit card
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* ─── Right: Preview ─── */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="sticky top-6">
              <Preview data={data} />
            </div>
          </div>
        </div>

        {/* Mobile preview */}
        <div className="lg:hidden mt-10">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Preview</p>
          <Preview data={data} className="max-w-sm" />
        </div>
      </div>
    </main>
  );
}
