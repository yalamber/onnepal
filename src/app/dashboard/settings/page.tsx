'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Check, Camera, X, ImageIcon } from 'lucide-react';
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
  logoUrl: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
}

function PhotoUpload({
  label,
  value,
  onChange,
  aspectHint,
  className = '',
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  aspectHint: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) { setError(data.error || 'Upload failed'); return; }
      if (data.url) onChange(data.url);
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      <p className="text-[0.625rem] text-gray-400 mt-0.5">{aspectHint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />
      {value ? (
        <div className="relative mt-2 group">
          <img
            src={value}
            alt={label}
            className={`w-full object-cover rounded-lg border border-gray-200 ${
              label.includes('Cover') ? 'h-24' : 'h-20 w-20'
            }`}
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onChange(null)}
              className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`mt-2 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors ${
            label.includes('Cover') ? 'w-full h-24' : 'w-20 h-20'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </button>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
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
          logoUrl: profile.logoUrl || '',
          coverImageUrl: profile.coverImageUrl || '',
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
      {/* Photos */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-900">Photos</p>
        <PhotoUpload
          label="Cover photo"
          value={profile.coverImageUrl}
          onChange={(url) => setProfile({ ...profile, coverImageUrl: url })}
          aspectHint="Recommended: 1200x400px, max 5MB"
        />
        <PhotoUpload
          label="Logo / Profile photo"
          value={profile.logoUrl}
          onChange={(url) => setProfile({ ...profile, logoUrl: url })}
          aspectHint="Square, max 5MB"
        />
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-900">Theme</p>
        <div className="grid grid-cols-5 gap-2.5">
          {THEME_PALETTES.map((palette) => {
            const isSelected = selectedPalette?.id === palette.id;
            return (
              <button
                key={palette.id}
                onClick={() => selectPalette(palette)}
                className={`group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-gray-900 bg-gray-50'
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
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${selectedPalette.primary}, ${selectedPalette.accent})` }}
            >
              {profile.businessName?.charAt(0) || 'B'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{profile.businessName}</p>
              <p className="text-[0.625rem] text-gray-500">{selectedPalette.name} theme</p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-white text-[0.625rem] font-medium"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              CTA
            </div>
          </div>
        )}
      </div>

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
