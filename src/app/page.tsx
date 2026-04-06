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
function Preview({ data }: { data: PageData }) {
  const activeLinks = data.links.filter(l => l.url.trim());
  const { primary, accent } = data.theme;

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="rounded-[1.25rem] bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden transition-all duration-500">
        {/* Cover — uses theme colors */}
        <div
          className="h-32 transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
        />

        <div className="px-5 pb-6 -mt-8 relative">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-xl font-bold transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
          >
            {data.businessName ? data.businessName.charAt(0).toUpperCase() : 'O'}
          </div>

          <h2 className="mt-3 text-lg font-bold text-slate-900 truncate">
            {data.businessName || 'Your Business'}
          </h2>
          {data.category ? (
            <p className="text-sm text-slate-500">{data.category}</p>
          ) : (
            <p className="text-sm text-slate-300 italic">Add a category</p>
          )}

          {/* CTA button — uses theme */}
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
                  <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 transition-all">
                    <Icon className={`h-4 w-4 ${p?.color || 'text-slate-500'}`} />
                    <span className="text-sm font-medium text-slate-700 truncate">{p?.label || link.platform}</span>
                    <ExternalLink className="h-3 w-3 text-slate-300 ml-auto flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-sm text-slate-300">Add links below</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100">
          <p className="text-xs text-center font-mono text-slate-400">
            {data.subdomain || 'yourbusiness'}.onnepal.com
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Theme Picker ─── */
function ThemePicker({ selected, onSelect }: { selected: ThemePalette; onSelect: (t: ThemePalette) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {THEME_PALETTES.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={`relative flex gap-0.5 rounded-xl p-1 transition-all duration-200 ${
            selected.id === t.id
              ? 'ring-2 ring-slate-900 ring-offset-2'
              : 'hover:ring-2 hover:ring-slate-200 hover:ring-offset-1'
          }`}
          title={t.name}
        >
          {t.preview.map((color, i) => (
            <div
              key={i}
              className={`w-6 h-6 ${i === 0 ? 'rounded-l-lg' : ''} ${i === 2 ? 'rounded-r-lg' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </button>
      ))}
    </div>
  );
}

/* ─── Inline field ─── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* ─── Page ─── */
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

  const canClaim = subdomainStatus === 'available' && data.businessName.length >= 2;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Create your page
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Fill in below — watch your page come alive on the right.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ─── Left: Builder ─── */}
          <div className="space-y-8">

            {/* Business info */}
            <section className="space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Business</h2>

              <Field label="Business name" hint="This appears on your page">
                <Input
                  value={data.businessName}
                  onChange={e => setData(d => ({ ...d, businessName: e.target.value }))}
                  placeholder="e.g. Himalayan Bites"
                  className="h-11"
                />
              </Field>

              <Field label="Page address" hint="Choose a unique name">
                <div className="flex">
                  <Input
                    value={data.subdomain}
                    onChange={e => setData(d => ({ ...d, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="himalayanbites"
                    maxLength={30}
                    className="rounded-r-none h-11 font-mono"
                  />
                  <span className="px-3 h-11 flex items-center bg-slate-50 border border-l-0 border-slate-200 rounded-r-xl text-sm text-slate-400 whitespace-nowrap">
                    .onnepal.com
                  </span>
                </div>
                <div className="h-5 mt-1">
                  {subdomainStatus === 'checking' && <span className="text-xs text-slate-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Checking</span>}
                  {subdomainStatus === 'available' && <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Available</span>}
                  {subdomainStatus === 'taken' && <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> Already taken</span>}
                </div>
              </Field>

              <Field label="Category" hint="Optional">
                <Input
                  value={data.category}
                  onChange={e => setData(d => ({ ...d, category: e.target.value }))}
                  placeholder="Restaurant, Salon, Travel..."
                  className="h-11"
                />
              </Field>
            </section>

            {/* Theme */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Theme</h2>
              <p className="text-sm text-slate-500">Pick a color palette — you can change it later.</p>
              <ThemePicker
                selected={data.theme}
                onSelect={(t) => setData(d => ({ ...d, theme: t }))}
              />
            </section>

            {/* Links */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Links</h2>
                <span className="text-xs text-slate-400">Optional — add after signup too</span>
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

              <button
                onClick={() => setData(d => ({ ...d, links: [...d.links, { platform: 'instagram', url: '' }] }))}
                className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add link
              </button>
            </section>

            {/* CTA */}
            <section className="pt-4 border-t border-slate-100">
              <Button
                onClick={() => router.push(`/signup?subdomain=${encodeURIComponent(data.subdomain)}&name=${encodeURIComponent(data.businessName)}`)}
                disabled={!canClaim}
                size="lg"
                className="w-full h-12 text-base"
              >
                {canClaim ? (
                  <>Claim {data.subdomain}.onnepal.com <ArrowRight className="h-4 w-4 ml-1" /></>
                ) : (
                  'Enter a name and choose an address'
                )}
              </Button>
              <p className="text-xs text-slate-400 text-center mt-3">
                Free forever &middot; No credit card &middot; Takes 2 minutes
              </p>
            </section>
          </div>

          {/* ─── Right: Live Preview ─── */}
          <div className="lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Preview</p>
              <p className="text-xs text-slate-400">Updates as you type</p>
            </div>
            <Preview data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
