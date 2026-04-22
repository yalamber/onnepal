'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Check, Palette, Building2, Phone, MapPin, Clock } from 'lucide-react';
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

  const { business } = useActiveBusiness();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!business) return;
      try {
        const res = await fetch(`/api/business/profile?businessId=${business.id}`);
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json() as { profile: Profile };
        setProfile(data.profile);
        const palette = findPalette(data.user.primaryColor || '', data.user.accentColor || '');
        setSelectedPalette(palette || THEME_PALETTES[0]);
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [router, business]);

  const selectPalette = (palette: ThemePalette) => {
    setSelectedPalette(palette);
    if (profile) {
      setProfile({ ...profile, primaryColor: palette.primary, accentColor: palette.accent });
    }
  };

  const handleSave = async () => {
    if (!profile || !business) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/business/profile?businessId=${business.id}`, {
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your business profile and appearance</p>
      </div>

      {/* Business Info */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-900">Business information</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Business Name</label>
            <Input
              value={profile.businessName || ''}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Category</label>
            <Input
              value={profile.businessCategory || ''}
              onChange={(e) => setProfile({ ...profile, businessCategory: e.target.value })}
              placeholder="Restaurant, Retail, etc."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Description</label>
            <Textarea
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="What does your business do?"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-900">Contact details</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-gray-400" /> Phone
              </label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+977-..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-gray-400" /> Business Hours
              </label>
              <Input
                value={profile.businessHours || ''}
                onChange={(e) => setProfile({ ...profile, businessHours: e.target.value })}
                placeholder="Sun-Fri: 9 AM - 6 PM"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-gray-400" /> Address
            </label>
            <Input
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Kathmandu, Nepal"
            />
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Palette className="h-4 w-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-900">Theme</p>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-5 gap-2.5">
            {THEME_PALETTES.map((palette) => {
              const isSelected = selectedPalette?.id === palette.id;
              return (
                <button
                  key={palette.id}
                  onClick={() => selectPalette(palette)}
                  className={`group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50 shadow-sm'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex gap-0.5 w-full">
                    {palette.preview.map((color, i) => (
                      <div
                        key={i}
                        className={`h-7 flex-1 ${i === 0 ? 'rounded-l-lg' : ''} ${i === 2 ? 'rounded-r-lg' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className={`text-[0.625rem] font-medium ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>{palette.name}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mini preview */}
          {selectedPalette && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${selectedPalette.primary}, ${selectedPalette.accent})` }}
              >
                {profile.businessName?.charAt(0) || 'B'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{profile.businessName}</p>
                <p className="text-xs text-gray-500">{selectedPalette.name} theme</p>
              </div>
              <div
                className="px-4 py-1.5 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: selectedPalette.primary }}
              >
                Button
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 sticky bottom-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-lg">
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 text-white hover:bg-indigo-700 gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save changes</>}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
            <Check className="h-4 w-4" /> Changes saved
          </span>
        )}
      </div>
    </div>
  );
}
