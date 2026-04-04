'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save, ExternalLink, Check, Palette } from 'lucide-react';
import { THEME_PALETTES, findPalette, type ThemePalette } from '@/lib/themes';

interface Profile {
  subdomain: string;
  businessName: string;
  businessCategory: string | null;
  description: string | null;
  phone: string | null;
  address: string | null;
  businessHours: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  isPublished: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<ThemePalette | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json() as { user: Profile };
        setProfile(data.user);
        const palette = findPalette(data.user.primaryColor || '', data.user.accentColor || '');
        setSelectedPalette(palette || THEME_PALETTES[0]);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const selectPalette = (palette: ThemePalette) => {
    setSelectedPalette(palette);
    if (profile) {
      setProfile({ ...profile, primaryColor: palette.primary, accentColor: palette.accent });
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: profile.businessName,
          businessCategory: profile.businessCategory,
          description: profile.description,
          phone: profile.phone,
          address: profile.address,
          businessHours: profile.businessHours,
          primaryColor: profile.primaryColor,
          accentColor: profile.accentColor,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-[1.375rem] font-bold tracking-[-0.025em] text-slate-900 leading-[1.2]">Settings</h1>
      </div>

      {/* Site URL */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Your page</CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href={`https://${profile.subdomain}.onnepal.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 text-sm"
          >
            {profile.subdomain}.onnepal.com <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
          <CardDescription>This appears on your public page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Business Name</Label>
            <Input
              value={profile.businessName || ''}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input
              value={profile.businessCategory || ''}
              onChange={(e) => setProfile({ ...profile, businessCategory: e.target.value })}
              placeholder="Restaurant, Retail, etc."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="What does your business do?"
              rows={3}
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Phone</Label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+977-..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Business Hours</Label>
              <Input
                value={profile.businessHours || ''}
                onChange={(e) => setProfile({ ...profile, businessHours: e.target.value })}
                placeholder="Sun-Fri: 9 AM - 6 PM"
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Kathmandu, Nepal"
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Palette */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-slate-400" />
            Theme
          </CardTitle>
          <CardDescription>Choose a color palette for your page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {THEME_PALETTES.map((palette) => {
              const isSelected = selectedPalette?.id === palette.id;
              return (
                <button
                  key={palette.id}
                  onClick={() => selectPalette(palette)}
                  className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {/* Color swatch */}
                  <div className="flex gap-0.5 w-full">
                    {palette.preview.map((color, i) => (
                      <div
                        key={i}
                        className={`h-8 flex-1 ${i === 0 ? 'rounded-l-lg' : ''} ${i === 2 ? 'rounded-r-lg' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-[0.6875rem] font-medium text-slate-600">{palette.name}</span>
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview */}
          {selectedPalette && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[0.6875rem] font-medium text-slate-400 uppercase tracking-wider mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${selectedPalette.primary}, ${selectedPalette.accent})` }}
                >
                  {profile.businessName?.charAt(0) || 'B'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{profile.businessName}</p>
                  <p className="text-xs text-slate-500">{profile.businessCategory || 'Your category'}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <div
                  className="px-4 py-1.5 rounded-full text-white text-xs font-medium"
                  style={{ backgroundColor: selectedPalette.primary }}
                >
                  Order Now
                </div>
                <div
                  className="px-4 py-1.5 rounded-full text-xs font-medium border"
                  style={{ borderColor: selectedPalette.primary, color: selectedPalette.primary }}
                >
                  Contact
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Changes</>}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
