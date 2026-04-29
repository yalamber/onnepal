'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight, Plus, Loader2, Tag, MapPin, Eye, Settings, Copy, Check,
  Briefcase, Calendar, AlertTriangle, ShoppingBag, LinkIcon, Megaphone,
} from 'lucide-react';
import { useActiveBusiness } from './layout';
import { timeAgo } from '@/lib/time-ago';

interface ClassifiedAd {
  id: string; title: string; price: string | null; category: string;
  location: string | null; status: string; createdAt: string;
}

export default function DashboardPage() {
  const { user, business, businesses, setBusiness } = useActiveBusiness();
  const [classifieds, setClassifieds] = useState<ClassifiedAd[]>([]);
  const [stats, setStats] = useState({ links: 0, products: 0, announcements: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classRes = await fetch('/api/classifieds?limit=5');
        if (classRes.ok) {
          const data = await classRes.json() as { listings: ClassifiedAd[] };
          setClassifieds(data.listings || []);
        }
        if (business) {
          const [linksRes, productsRes, announcementsRes] = await Promise.all([
            fetch(`/api/business/links?businessId=${business.id}`),
            fetch(`/api/business/products?businessId=${business.id}`),
            fetch(`/api/business/announcements?businessId=${business.id}`),
          ]);
          const l = await linksRes.json() as { links?: unknown[] };
          const p = await productsRes.json() as { products?: unknown[] };
          const a = await announcementsRes.json() as { announcements?: unknown[] };
          setStats({ links: l.links?.length || 0, products: p.products?.length || 0, announcements: a.announcements?.length || 0 });
        }
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [business]);

  const copyUrl = async () => {
    if (!business) return;
    await navigator.clipboard.writeText(`https://${business.subdomain}.onnepal.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  const quickActions = [
    { href: '/classifieds/post/new', label: 'Post ad', desc: 'Sell or buy items', icon: Tag, color: 'bg-blue-50 text-blue-600' },
    { href: '/jobs/post/new', label: 'Post job', desc: 'Hire talent', icon: Briefcase, color: 'bg-emerald-50 text-emerald-600' },
    { href: '/events/post/new', label: 'Post event', desc: 'Share happenings', icon: Calendar, color: 'bg-purple-50 text-purple-600' },
    { href: '/lost-found/post/new', label: 'Report item', desc: 'Lost or found', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
          {user?.displayName ? `Hi, ${user.displayName}` : 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-gray-400">What would you like to do today?</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}
            className="flex flex-col items-start p-3.5 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center mb-2.5 ${action.color}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-gray-950 group-hover:text-gray-700">{action.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Active business card */}
      {business ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-950 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: business.primaryColor || '#4f46e5' }}>
                {business.businessName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{business.businessName}</p>
                <p className="text-gray-400 text-xs truncate">{business.subdomain}.onnepal.com</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={copyUrl} className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer" title="Copy URL">
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <a href={`https://${business.subdomain}.onnepal.com`} target="_blank" rel="noopener noreferrer"
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-md flex items-center gap-1 transition-colors">
                <Eye className="h-3 w-3" /> View
              </a>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Link href="/dashboard/links" className="p-2.5 border border-gray-100 rounded-md hover:border-gray-200 transition-colors group">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-gray-950">{stats.links}</p>
                  <LinkIcon className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500" />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Links</p>
              </Link>
              <Link href="/dashboard/products" className="p-2.5 border border-gray-100 rounded-md hover:border-gray-200 transition-colors group">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-gray-950">{stats.products}</p>
                  <ShoppingBag className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500" />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Products</p>
              </Link>
              <Link href="/dashboard/announcements" className="p-2.5 border border-gray-100 rounded-md hover:border-gray-200 transition-colors group">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-gray-950">{stats.announcements}</p>
                  <Megaphone className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500" />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Posts</p>
              </Link>
            </div>
            <div className="flex gap-1.5">
              <Link href="/dashboard/settings"
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 border border-gray-200 rounded-md hover:border-gray-300 hover:text-gray-950 transition-colors">
                <Settings className="h-3 w-3" /> Settings
              </Link>
              {!business.isPublished && (
                <span className="flex items-center px-2.5 py-1 text-[11px] text-amber-600 bg-amber-50 rounded-md">Not published</span>
              )}
            </div>
          </div>
        </div>
      ) : businesses.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-lg py-10 text-center">
          <p className="text-sm text-gray-400 mb-3">Want to create a business page?</p>
          <Link href="/create-business" className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
            Create business page
          </Link>
        </div>
      ) : null}

      {/* Other businesses */}
      {businesses.length > 1 && (
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Other businesses</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {businesses.filter(b => b.id !== business?.id).map((b) => (
              <button key={b.id} onClick={() => setBusiness(b)}
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-md hover:border-gray-200 transition-colors text-left cursor-pointer">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: b.primaryColor || '#1e293b' }}>
                  {b.businessName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-950 truncate">{b.businessName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{b.subdomain}.onnepal.com</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Browse sections */}
      <div>
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Browse</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { href: '/directory', label: 'Directory' },
            { href: '/classifieds', label: 'Classifieds' },
            { href: '/jobs', label: 'Jobs' },
            { href: '/events', label: 'Events' },
            { href: '/lost-found', label: 'Lost & Found' },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="px-3 py-2.5 border border-gray-100 rounded-md text-sm text-gray-600 hover:text-gray-950 hover:border-gray-200 transition-colors text-center">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent classifieds */}
      {classifieds.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Recent classifieds</p>
            <Link href="/classifieds" className="text-xs text-gray-400 hover:text-gray-950 transition-colors">View all &rarr;</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {classifieds.map((ad) => (
              <Link key={ad.id} href={`/classifieds/post/${ad.id}`} className="flex items-center justify-between py-2.5 group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-950 group-hover:underline truncate">{ad.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{ad.category}</span>
                    {ad.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ad.location}</span>}
                    <span>{timeAgo(ad.createdAt)}</span>
                  </div>
                </div>
                {ad.price && <p className="text-sm font-medium text-gray-950 flex-shrink-0 ml-4">{ad.price}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
