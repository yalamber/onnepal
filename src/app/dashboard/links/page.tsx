'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Loader2, GripVertical } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
}

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'viber', label: 'Viber' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'custom', label: 'Custom Link' },
];

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLink, setNewLink] = useState({ platform: 'facebook', url: '', label: '' });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/business/links');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data: { links?: SocialLink[] } = await res.json();
      setLinks(data.links || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const addLink = async () => {
    if (!newLink.url.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/business/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });
      if (res.ok) {
        setNewLink({ platform: 'facebook', url: '', label: '' });
        await fetchLinks();
      }
    } finally {
      setAdding(false);
    }
  };

  const deleteLink = async (id: string) => {
    await fetch(`/api/business/links/${id}`, { method: 'DELETE' });
    setLinks(links.filter((l) => l.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Social Links</h1>
      </div>

      {/* Add new link */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add a link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <select
              value={newLink.platform}
              onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
              className="h-10 px-3 border border-neutral-200 rounded-lg text-sm bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-950/10 outline-none transition-all"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <Input
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Input
              value={newLink.label}
              onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
              placeholder="Custom label (optional)"
              className="flex-1"
            />
            <Button
              onClick={addLink}
              disabled={adding || !newLink.url.trim()}
              className="bg-neutral-950 text-white hover:bg-neutral-800"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing links */}
      <div className="space-y-2">
        {links.length === 0 ? (
          <p className="text-center text-neutral-400 py-8">No links yet. Add your first link above.</p>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200"
            >
              <GripVertical className="h-5 w-5 text-neutral-300 cursor-grab" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-neutral-900">
                  {link.label || PLATFORMS.find((p) => p.value === link.platform)?.label || link.platform}
                </p>
                <p className="text-xs text-neutral-400 truncate">{link.url}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteLink(link.id)}
                className="text-neutral-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
