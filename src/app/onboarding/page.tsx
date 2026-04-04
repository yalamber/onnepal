'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, Check, Plus, Trash2 } from 'lucide-react';

interface UserData {
  onboardingStep: number;
  subdomain: string;
  businessName: string;
}

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

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [links, setLinks] = useState<Array<{ platform: string; url: string }>>([
    { platform: 'facebook', url: '' },
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json() as { user: UserData };
        setUser(data.user);
        if (data.user.onboardingStep >= 4) { router.push('/dashboard'); return; }
        setStep(Math.max(data.user.onboardingStep, 1));
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, [router]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessCategory: category, description, phone, address }),
      });
      if (res.ok) setStep(3);
    } finally { setSaving(false); }
  };

  const saveLinks = async () => {
    setSaving(true);
    try {
      const validLinks = links.filter((l) => l.url.trim());
      for (const link of validLinks) {
        await fetch('/api/business/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(link),
        });
      }
      await fetch('/api/business/publish', { method: 'POST' });
      router.push('/dashboard');
    } finally { setSaving(false); }
  };

  const addLink = () => setLinks([...links, { platform: 'facebook', url: '' }]);
  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
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
                s <= step ? 'bg-slate-950 w-10' : 'bg-slate-200 w-6'
              }`}
            />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="text-center animate-fade-in">
            <h1 className="text-xl font-bold text-slate-950 tracking-tight leading-[1.2]">Welcome, {user?.businessName}!</h1>
            <p className="text-slate-500 text-sm mt-3 leading-[1.6]">
              Your page will be at <span className="font-mono text-slate-950 tracking-tight">{user?.subdomain}.onnepal.com</span>
            </p>
            <p className="text-slate-400 text-sm mt-4 mb-8 leading-[1.6]">
              Let&apos;s set up your business page. It only takes a couple of minutes.
            </p>
            <Button onClick={() => setStep(2)}>
              Let&apos;s go <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-slate-950 tracking-tight leading-[1.2] mb-1">Business Details</h2>
            <p className="text-slate-500 text-sm mb-6 leading-[1.6]">Tell us about your business</p>

            <div className="space-y-5">
              <div>
                <Label className="text-slate-700">Category</Label>
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 text-xs rounded-lg border transition-all duration-150 ${
                        category === cat
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-700">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your business do?"
                  maxLength={500}
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-slate-700">Phone (optional)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977-..." className="mt-1.5" />
              </div>

              <div>
                <Label htmlFor="address" className="text-slate-700">Address (optional)</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kathmandu, Nepal" className="mt-1.5" />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={saveProfile} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next <ArrowRight className="h-4 w-4 ml-1" /></>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-slate-950 tracking-tight leading-[1.2] mb-1">Add Your Links</h2>
            <p className="text-slate-500 text-sm mb-6 leading-[1.6]">Connect your social profiles and website</p>

            <div className="space-y-4">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select
                    value={link.platform}
                    onChange={(e) => {
                      const updated = [...links];
                      updated[i].platform = e.target.value;
                      setLinks(updated);
                    }}
                    className="h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...links];
                      updated[i].url = e.target.value;
                      setLinks(updated);
                    }}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  {links.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}>
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                <Plus className="h-4 w-4 mr-1" /> Add another
              </Button>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={saveLinks} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Publish <Check className="h-4 w-4 ml-1" /></>}
                </Button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/business/publish', { method: 'POST' });
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
