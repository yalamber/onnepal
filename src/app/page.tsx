'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { THEME_PALETTES, DEFAULT_PALETTE, type ThemePalette } from '@/lib/themes';
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
  theme: ThemePalette;
  links: Array<{ platform: string; url: string }>;
}

/* ─── Live Preview ─── */
function Preview({ data, className = '' }: { data: PageData; className?: string }) {
  const activeLinks = data.links.filter(l => l.url.trim());
  const { primary, accent } = data.theme;
  const hasName = data.businessName.length > 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden transition-all duration-500">
        {/* Cover */}
        <div className="h-28 sm:h-32 transition-all duration-500" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }} />

        <div className="px-5 pb-5 -mt-7 relative">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
          >
            {hasName ? data.businessName.charAt(0).toUpperCase() : 'O'}
          </div>

          <h2 className="mt-3 text-lg font-bold text-slate-900 truncate">
            {data.businessName || 'Your Business'}
          </h2>
          <p className="text-sm text-slate-400">{data.category || 'Your category'}</p>

          {/* CTA */}
          <button
            className="w-full mt-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-500"
            style={{ backgroundColor: primary }}
          >
            Contact us
          </button>

          {/* Links */}
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

        {/* URL bar */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100">
          <p className="text-xs text-center font-mono text-slate-400">
            {data.subdomain || 'yourbusiness'}.onnepal.com
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Section that reveals with animation ─── */
function Section({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const [data, setData] = useState<PageData>({
    subdomain: '',
    businessName: '',
    category: '',
    theme: DEFAULT_PALETTE,
    links: [{ platform: 'facebook', url: '' }],
  });

  // Progressive reveal flags
  const hasName = data.businessName.length >= 2;
  const hasSubdomain = data.subdomain.length >= 3;

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

  const canClaim = subdomainStatus === 'available' && hasName;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero — the entry point */}
      <div className="pt-20 pb-10 sm:pt-24 sm:pb-14 px-4 sm:px-6">
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

          {/* ─── Left: Form (3 cols) ─── */}
          <div className="lg:col-span-3 space-y-6 max-w-lg">

            {/* 1. Business name — always visible, autofocus */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                What&apos;s your business called?
              </label>
              <Input
                value={data.businessName}
                onChange={e => setData(d => ({ ...d, businessName: e.target.value }))}
                placeholder="e.g. Himalayan Bites"
                className="h-12 text-base"
                autoFocus
              />
            </div>

            {/* 2. Subdomain — reveals after name */}
            <Section show={hasName}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Choose your page address
                </label>
                <div className="flex">
                  <Input
                    value={data.subdomain}
                    onChange={e => setData(d => ({ ...d, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder={data.businessName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'yourbusiness'}
                    maxLength={30}
                    className="rounded-r-none h-12 text-base font-mono"
                  />
                  <span className="px-3 h-12 flex items-center bg-slate-50 border border-l-0 border-slate-200 rounded-r-xl text-sm text-slate-400 whitespace-nowrap">
                    .onnepal.com
                  </span>
                </div>
                <div className="h-5 mt-1">
                  {subdomainStatus === 'checking' && <span className="text-xs text-slate-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Checking availability</span>}
                  {subdomainStatus === 'available' && <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> {data.subdomain}.onnepal.com is yours</span>}
                  {subdomainStatus === 'taken' && <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> Already taken — try another</span>}
                </div>
              </div>
            </Section>

            {/* 3. Category + Theme — reveals after subdomain */}
            <Section show={hasName && hasSubdomain}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    What kind of business? <span className="font-normal text-slate-400">optional</span>
                  </label>
                  <Input
                    value={data.category}
                    onChange={e => setData(d => ({ ...d, category: e.target.value }))}
                    placeholder="Restaurant, Salon, Travel, Shop..."
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pick a color theme
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {THEME_PALETTES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setData(d => ({ ...d, theme: t }))}
                        className={`group relative flex items-center gap-0.5 rounded-xl p-1.5 transition-all duration-200 ${
                          data.theme.id === t.id
                            ? 'ring-2 ring-slate-900 ring-offset-2 scale-105'
                            : 'hover:scale-105 hover:shadow-md'
                        }`}
                        title={t.name}
                      >
                        {t.preview.map((color, i) => (
                          <div
                            key={i}
                            className={`w-7 h-7 ${i === 0 ? 'rounded-l-lg' : ''} ${i === 2 ? 'rounded-r-lg' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        {data.theme.id === t.id && (
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[0.6rem] font-medium text-slate-500 whitespace-nowrap">
                            {t.name}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* 4. Links — reveals after theme section is visible */}
            <Section show={hasName && hasSubdomain}>
              <div className="pt-2 space-y-3">
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Add your links
                  </label>
                  <span className="text-xs text-slate-400">you can add more later</span>
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
                    <Plus className="h-3.5 w-3.5" /> Add another link
                  </button>
                )}
              </div>
            </Section>

            {/* CTA — reveals when form has enough data */}
            <Section show={canClaim}>
              <div className="pt-3">
                <Button
                  onClick={() => router.push(`/signup?subdomain=${encodeURIComponent(data.subdomain)}&name=${encodeURIComponent(data.businessName)}`)}
                  size="lg"
                  className="w-full h-12 text-base"
                >
                  Create {data.subdomain}.onnepal.com <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Free forever &middot; No credit card &middot; Takes 2 minutes
                </p>
              </div>
            </Section>
          </div>

          {/* ─── Right: Preview (2 cols) ─── */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="sticky top-6">
              <Preview data={data} />
            </div>
          </div>
        </div>

        {/* Mobile preview — below form */}
        <div className="lg:hidden mt-10">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Preview</p>
          <Preview data={data} className="max-w-sm" />
        </div>
      </div>
    </main>
  );
}
