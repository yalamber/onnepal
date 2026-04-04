'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save, ExternalLink } from 'lucide-react';

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json() as { user: Profile };
        setProfile(data.user);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

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
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-[1.375rem] font-bold tracking-[-0.025em] text-neutral-950 leading-[1.2]">Settings</h1>
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
            className="font-mono text-neutral-950 hover:underline flex items-center gap-1"
          >
            {profile.subdomain}.onnepal.com <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
          <CardDescription>Update your business details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Business Name</Label>
            <Input
              value={profile.businessName || ''}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input
              value={profile.businessCategory || ''}
              onChange={(e) => setProfile({ ...profile, businessCategory: e.target.value })}
              placeholder="Restaurant, Retail, etc."
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="What does your business do?"
              rows={3}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+977-..."
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Kathmandu, Nepal"
            />
          </div>
          <div>
            <Label>Business Hours</Label>
            <Input
              value={profile.businessHours || ''}
              onChange={(e) => setProfile({ ...profile, businessHours: e.target.value })}
              placeholder="Sun-Fri: 9 AM - 6 PM"
            />
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Brand Colors</CardTitle>
          <CardDescription>Customize the look of your page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={profile.primaryColor || '#5B5BD6'}
                  onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={profile.primaryColor || '#5B5BD6'}
                  onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={profile.accentColor || '#3E3EA6'}
                  onChange={(e) => setProfile({ ...profile, accentColor: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={profile.accentColor || '#3E3EA6'}
                  onChange={(e) => setProfile({ ...profile, accentColor: e.target.value })}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-neutral-950 text-white hover:bg-neutral-800"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Save Changes</>}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </div>
  );
}
