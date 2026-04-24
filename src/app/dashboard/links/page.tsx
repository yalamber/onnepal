'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus, Trash2, Loader2, GripVertical, LinkIcon,
  Facebook, Instagram, Youtube, Globe, MessageCircle, Phone, Mail, Twitter, Linkedin,
} from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
}

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600 bg-blue-50' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600 bg-pink-50' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600 bg-green-50' },
  { value: 'tiktok', label: 'TikTok', icon: Globe, color: 'text-gray-900 bg-gray-100' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600 bg-red-50' },
  { value: 'viber', label: 'Viber', icon: MessageCircle, color: 'text-violet-600 bg-violet-50' },
  { value: 'twitter', label: 'Twitter / X', icon: Twitter, color: 'text-sky-600 bg-sky-50' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700 bg-blue-50' },
  { value: 'website', label: 'Website', icon: Globe, color: 'text-indigo-600 bg-indigo-50' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-gray-600 bg-gray-100' },
  { value: 'phone', label: 'Phone', icon: Phone, color: 'text-emerald-600 bg-emerald-50' },
  { value: 'custom', label: 'Custom Link', icon: LinkIcon, color: 'text-gray-600 bg-gray-100' },
];

function getPlatform(value: string) {
  return PLATFORMS.find((p) => p.value === value) || PLATFORMS[PLATFORMS.length - 1];
}

export default function LinksPage() {
  const router = useRouter();
  const { business } = useActiveBusiness();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newLink, setNewLink] = useState({ platform: 'facebook', url: '', label: '' });

  const fetchLinks = async () => {
    if (!business) return;
    try {
      const res = await fetch(`/api/business/links?businessId=${business.id}`);
      if (res.status === 401) { router.push('/login'); return; }
      const data: { links?: SocialLink[] } = await res.json();
      setLinks(data.links || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchLinks(); }, [business]);

  const addLink = async () => {
    if (!newLink.url.trim() || !business) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/business/links?businessId=${business.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });
      if (res.ok) {
        setNewLink({ platform: 'facebook', url: '', label: '' });
        setShowForm(false);
        await fetchLinks();
      }
    } finally { setAdding(false); }
  };

  const deleteLink = async (id: string) => {
    if (!business) return;
    await fetch(`/api/business/links/${id}?businessId=${business.id}`, { method: 'DELETE' });
    setLinks(links.filter((l) => l.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {business && <ModuleToggle moduleKey="links" label="Links" businessId={business.id} enabledModules={business.enabledModules} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Social Links</h2>
          <p className="text-sm text-gray-500 mt-0.5">Connect your social profiles and websites</p>
        </div>
        {!showForm && links.length > 0 && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Add link
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-900">Add a new link</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Platform</label>
              <select
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Custom label <span className="text-gray-400 font-normal">(optional)</span></label>
              <Input
                value={newLink.label}
                onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                placeholder="My Facebook Page"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">URL</label>
            <Input
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
              onKeyDown={(e) => { if (e.key === 'Enter') addLink(); }}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setNewLink({ platform: 'facebook', url: '', label: '' }); }}>
              Cancel
            </Button>
            <Button
              onClick={addLink}
              disabled={adding || !newLink.url.trim()}
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add link'}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {links.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
            <LinkIcon className="h-6 w-6 text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No links yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your social profiles and website links</p>
          <Button onClick={() => setShowForm(true)} size="sm" className="mt-4 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Add your first link
          </Button>
        </div>
      ) : links.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
          {links.map((link) => {
            const platform = getPlatform(link.platform);
            const Icon = platform.icon;
            return (
              <div
                key={link.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors group"
              >
                <GripVertical className="h-4 w-4 text-gray-200 cursor-grab flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${platform.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">
                    {link.label || platform.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{link.url}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteLink(link.id)}
                  className="text-gray-300 hover:text-red-500 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
