'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Check } from 'lucide-react';

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
      } catch { router.push('/login'); }
      finally { setLoading(false); }
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
    } finally { setSaving(false); }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Business Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-900">Business information</p>
        <div>
          <Label className="text-xs">Business Name</Label>
          <Input
            value={profile.businessName || ''}
            onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Category</Label>
          <Input
            value={profile.businessCategory || ''}
            onChange={(e) => setProfile({ ...profile, businessCategory: e.target.value })}
            placeholder="Restaurant, Retail, etc."
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Description</Label>
          <Textarea
            value={profile.description || ''}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            placeholder="What does your business do?"
            rows={3}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Phone</Label>
            <Input
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+977-..."
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Business Hours</Label>
            <Input
              value={profile.businessHours || ''}
              onChange={(e) => setProfile({ ...profile, businessHours: e.target.value })}
              placeholder="Sun-Fri: 9 AM - 6 PM"
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Address</Label>
          <Input
            value={profile.address || ''}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            placeholder="Kathmandu, Nepal"
            className="mt-1"
          />
        </div>
      </div>

      {/* Brand Colors */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-900">Brand colors</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Primary Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={profile.primaryColor || '#5B5BD6'}
                onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <Input
                value={profile.primaryColor || '#5B5BD6'}
                onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Accent Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={profile.accentColor || '#3E3EA6'}
                onChange={(e) => setProfile({ ...profile, accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <Input
                value={profile.accentColor || '#3E3EA6'}
                onChange={(e) => setProfile({ ...profile, accentColor: e.target.value })}
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 sticky bottom-4 bg-white/90 backdrop-blur-sm p-3 -mx-1 rounded-xl border border-gray-200 shadow-sm">
        <Button onClick={handleSave} disabled={saving} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Save changes</>}
        </Button>
        {saved && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
