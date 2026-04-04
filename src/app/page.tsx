'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Facebook, Instagram, MessageCircle, Globe, Phone, MapPin,
  ExternalLink, ArrowRight, Plus, X, Loader2, Check, Image,
} from 'lucide-react';

const SOCIAL_OPTIONS = [
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', placeholder: 'facebook.com/yourbusiness' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', placeholder: 'instagram.com/yourbusiness' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', placeholder: '+977 98...' },
  { value: 'tiktok', label: 'TikTok', icon: Globe, color: 'text-slate-900', placeholder: 'tiktok.com/@yourbusiness' },
  { value: 'website', label: 'Website', icon: Globe, color: 'text-blue-500', placeholder: 'yourwebsite.com' },
];

interface BuilderState {
  subdomain: string;
  businessName: string;
  category: string;
  description: string;
  phone: string;
  links: Array<{ platform: string; url: string }>;
}

/* Live preview that updates as they type */
function LivePreview({ data }: { data: BuilderState }) {
  const hasContent = data.businessName || data.links.some(l => l.url);

  return (
    <div className="w-full max-w-[300px] mx-auto">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">
        {/* Cover gradient */}
        <div className="h-20 bg-gradient-to-br from-blue-500 to-blue-700" />

        <div className="px-4 pb-4 -mt-5 relative">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 border-[3px] border-white flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {data.businessName ? data.businessName.charAt(0).toUpperCase() : '?'}
          </div>

          <div className="mt-2">
            <p className="font-bold text-slate-900 text-sm truncate">
              {data.businessName || 'Your Business Name'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {data.category || 'Category'}{data.phone ? ` · ${data.phone}` : ''}
            </p>
          </div>

          {data.description && (
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{data.description}</p>
          )}

          {/* Links */}
          {data.links.some(l => l.url) && (
            <div className="mt-3 space-y-1">
              {data.links.filter(l => l.url).map((link, i) => {
                const opt = SOCIAL_OPTIONS.find(s => s.value === link.platform);
                const Icon = opt?.icon || Globe;
                return (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                    <Icon className={`h-3.5 w-3.5 ${opt?.color || 'text-slate-500'}`} />
                    <span className="text-xs font-medium text-slate-600 truncate">{opt?.label || link.platform}</span>
                    <ExternalLink className="h-2.5 w-2.5 text-slate-300 ml-auto flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state hint */}
          {!hasContent && (
            <div className="mt-4 text-center py-6">
              <p className="text-xs text-slate-300">Start filling in the form</p>
              <p className="text-xs text-slate-300">to see your page here</p>
            </div>
          )}
        </div>
      </div>

      {/* URL */}
      <p className="text-center mt-2.5 text-xs font-mono text-slate-400">
        {data.subdomain || 'yourbusiness'}.onnepal.com
      </p>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const [data, setData] = useState<BuilderState>({
    subdomain: '',
    businessName: '',
    category: '',
    description: '',
    phone: '',
    links: [{ platform: 'facebook', url: '' }],
  });

  const updateField = (field: keyof BuilderState, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubdomainChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    updateField('subdomain', clean);

    if (checkTimeout) clearTimeout(checkTimeout);
    if (clean.length < 3) { setSubdomainStatus('idle'); return; }

    setSubdomainStatus('checking');
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/subdomain/check?name=${encodeURIComponent(clean)}`);
        const d = await res.json() as { available?: boolean };
        setSubdomainStatus(res.ok && d.available ? 'available' : 'taken');
      } catch { setSubdomainStatus('idle'); }
    }, 400);
    setCheckTimeout(t);
  };

  const addLink = () => {
    setData(prev => ({ ...prev, links: [...prev.links, { platform: 'facebook', url: '' }] }));
  };

  const removeLink = (i: number) => {
    setData(prev => ({ ...prev, links: prev.links.filter((_, idx) => idx !== i) }));
  };

  const updateLink = (i: number, field: 'platform' | 'url', value: string) => {
    setData(prev => {
      const links = [...prev.links];
      links[i] = { ...links[i], [field]: value };
      return { ...prev, links };
    });
  };

  const handleClaim = () => {
    if (subdomainStatus === 'available') {
      router.push(`/signup?subdomain=${encodeURIComponent(data.subdomain)}&name=${encodeURIComponent(data.businessName)}`);
    }
  };

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Build your business page
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Fill in the details below. See your page come alive on the right.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
          {/* Left: Form (3 cols) */}
          <div className="lg:col-span-3 space-y-8">

            {/* Section 1: Name & subdomain */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Business info</h2>

              <div>
                <Label>Page address</Label>
                <div className="flex items-center mt-1.5">
                  <Input
                    value={data.subdomain}
                    onChange={e => handleSubdomainChange(e.target.value)}
                    placeholder="yourbusiness"
                    maxLength={30}
                    className="rounded-r-none"
                  />
                  <span className="px-3 h-10 flex items-center bg-slate-50 border border-l-0 border-slate-200 rounded-r-xl text-sm text-slate-400">
                    .onnepal.com
                  </span>
                </div>
                <div className="h-5 mt-1">
                  {subdomainStatus === 'checking' && (
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Checking...</span>
                  )}
                  {subdomainStatus === 'available' && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Available</span>
                  )}
                  {subdomainStatus === 'taken' && (
                    <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> Taken</span>
                  )}
                </div>
              </div>

              <div>
                <Label>Business name</Label>
                <Input
                  value={data.businessName}
                  onChange={e => updateField('businessName', e.target.value)}
                  placeholder="Himalayan Bites"
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={data.category}
                    onChange={e => updateField('category', e.target.value)}
                    placeholder="Restaurant, Salon..."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={data.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    placeholder="+977 98..."
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Description <span className="text-slate-400 font-normal">(optional)</span></Label>
                <Textarea
                  value={data.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="What does your business do?"
                  rows={2}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Section 2: Social links */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-slate-900">Social links</h2>
              <p className="text-sm text-slate-400">Add your social profiles so customers can find you.</p>

              {data.links.map((link, i) => {
                const opt = SOCIAL_OPTIONS.find(s => s.value === link.platform);
                return (
                  <div key={i} className="flex gap-2 items-start">
                    <select
                      value={link.platform}
                      onChange={e => updateLink(i, 'platform', e.target.value)}
                      className="h-10 px-3 border border-slate-200 rounded-xl text-sm bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      {SOCIAL_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <Input
                      value={link.url}
                      onChange={e => updateLink(i, 'url', e.target.value)}
                      placeholder={opt?.placeholder || 'https://...'}
                      className="flex-1"
                    />
                    {data.links.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeLink(i)} className="flex-shrink-0">
                        <X className="h-4 w-4 text-slate-400" />
                      </Button>
                    )}
                  </div>
                );
              })}

              <Button variant="outline" size="sm" onClick={addLink}>
                <Plus className="h-4 w-4" /> Add link
              </Button>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-slate-100">
              <Button
                onClick={handleClaim}
                disabled={subdomainStatus !== 'available' || !data.businessName}
                size="lg"
                className="w-full sm:w-auto"
              >
                Claim {data.subdomain || 'yourbusiness'}.onnepal.com
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-xs text-slate-400 mt-2">
                Free forever. You&apos;ll create an account on the next step.
              </p>
            </div>
          </div>

          {/* Right: Live preview (2 cols) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4 hidden lg:block">Live preview</p>
              <LivePreview data={data} />
            </div>
          </div>
        </div>
      </div>

      {/* Minimal footer */}
      <footer className="border-t border-slate-100 py-6 mt-16">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-slate-500 text-sm font-medium">OnNepal</span>
          <div className="flex gap-4 text-xs text-slate-400">
            <span>Free for all Nepali businesses</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
