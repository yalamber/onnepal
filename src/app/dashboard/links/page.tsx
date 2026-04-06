'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react';

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

  useEffect(() => { fetchLinks(); }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/business/links');
      if (res.status === 401) { router.push('/login'); return; }
      const data: { links?: SocialLink[] } = await res.json();
      setLinks(data.links || []);
    } catch {} finally { setLoading(false); }
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
    } finally { setAdding(false); }
  };

  const deleteLink = async (id: string) => {
    await fetch(`/api/business/links/${id}`, { method: 'DELETE' });
    setLinks(links.filter((l) => l.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Add form */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-900">Add a link</p>
        <div className="flex gap-2">
          <select
            value={newLink.platform}
            onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
            className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
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
            onKeyDown={(e) => { if (e.key === 'Enter') addLink(); }}
          />
        </div>
        <div className="flex gap-2">
          <Input
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            placeholder="Custom label (optional)"
            className="flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter') addLink(); }}
          />
          <Button
            onClick={addLink}
            disabled={adding || !newLink.url.trim()}
            size="sm"
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {links.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No links yet. Add your first link above.</p>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 p-3.5 bg-white rounded-lg border border-gray-200"
            >
              <GripVertical className="h-4 w-4 text-gray-300 cursor-grab flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">
                  {link.label || PLATFORMS.find((p) => p.value === link.platform)?.label || link.platform}
                </p>
                <p className="text-xs text-gray-400 truncate">{link.url}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteLink(link.id)}
                className="text-gray-400 hover:text-red-500 h-8 w-8"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
