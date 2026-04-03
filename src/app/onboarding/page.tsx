'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

  // Step 2 fields
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step 3 fields
  const [links, setLinks] = useState<Array<{ platform: string; url: string }>>([
    { platform: 'facebook', url: '' },
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json() as { user: UserData };
        setUser(data.user);
        // If onboarding complete, go to dashboard
        if (data.user.onboardingStep >= 4) {
          router.push('/dashboard');
          return;
        }
        setStep(Math.max(data.user.onboardingStep, 1));
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessCategory: category,
          description,
          phone,
          address,
        }),
      });
      if (res.ok) setStep(3);
    } finally {
      setSaving(false);
    }
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
      // Publish the site
      await fetch('/api/business/publish', { method: 'POST' });
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    setLinks([...links, { platform: 'facebook', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full ${
                s <= step ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome, {user?.businessName}!</CardTitle>
              <CardDescription>
                Your page will be at{' '}
                <span className="font-mono text-orange-600">{user?.subdomain}.onnepal.com</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Let&apos;s set up your business page. It only takes a couple of minutes.
              </p>
              <Button
                onClick={() => setStep(2)}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white"
              >
                Let&apos;s go <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Business Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                        category === cat
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your business do?"
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+977-..."
                />
              </div>

              <div>
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kathmandu, Nepal"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next <ArrowRight className="h-4 w-4 ml-1" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Social Links */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Add Your Links</CardTitle>
              <CardDescription>Connect your social profiles and website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select
                    value={link.platform}
                    onChange={(e) => {
                      const updated = [...links];
                      updated[i].platform = e.target.value;
                      setLinks(updated);
                    }}
                    className="px-3 py-2 border rounded-md text-sm bg-white"
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLink(i)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </Button>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                <Plus className="h-4 w-4 mr-1" /> Add another link
              </Button>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  onClick={saveLinks}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Publish my page <Check className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/business/publish', { method: 'POST' });
                  router.push('/dashboard');
                }}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
              >
                Skip for now
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
