'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveBusiness } from '../layout';
import { ModuleToggle } from '@/components/module-toggle';
import { Input } from '@/components/ui/input';
import {
  Plus, Trash2, Loader2, LinkIcon,
  Facebook, Instagram, Youtube, Globe, MessageCircle, Phone, Mail, Twitter, Linkedin, X,
} from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
}

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'tiktok', label: 'TikTok', icon: Globe },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'viber', label: 'Viber', icon: MessageCircle },
  { value: 'twitter', label: 'Twitter / X', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'custom', label: 'Custom Link', icon: LinkIcon },
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      {business && <ModuleToggle moduleKey="links" label="Links" businessId={business.id} enabledModules={business.enabledModules} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Social Links</h2>
          <p className="text-sm text-gray-500 mt-0.5">Connect your social profiles and websites</p>
        </div>
        {!showForm && links.length > 0 && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add link
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">New link</p>
            <button onClick={() => { setShowForm(false); setNewLink({ platform: 'facebook', url: '', label: '' }); }}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Platform</label>
              <select
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-950/10 outline-none transition-all"
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
            <button onClick={() => { setShowForm(false); setNewLink({ platform: 'facebook', url: '', label: '' }); }}
              className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">Cancel</button>
            <button onClick={addLink} disabled={adding || !newLink.url.trim()}
              className="h-9 px-4 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 cursor-pointer transition-colors">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add link'}
            </button>
          </div>
        </div>
      )}

      {links.length === 0 && !showForm ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <LinkIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">No links yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your social profiles and website links</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
            <Plus className="h-4 w-4 inline mr-1" /> Add your first link
          </button>
        </div>
      ) : links.length > 0 && (
        <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">
          {links.map((link) => {
            const platform = getPlatform(link.platform);
            const Icon = platform.icon;
            return (
              <div key={link.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-950">
                    {link.label || platform.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{link.url}</p>
                </div>
                <button onClick={() => deleteLink(link.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
