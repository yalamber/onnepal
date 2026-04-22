'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink, LinkIcon, Megaphone, ShoppingBag, ArrowRight, Loader2,
  Copy, Check, Settings, TrendingUp, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = useState({ links: 0, products: 0, announcements: 0 });
  const [subdomain, setSubdomain] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, linksRes, productsRes, announcementsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/business/links'),
          fetch('/api/business/products'),
          fetch('/api/business/announcements'),
        ]);
        if (meRes.ok) {
          const meData = await meRes.json() as { user: { subdomain: string; businessName: string } };
          setSubdomain(meData.user.subdomain);
          setBusinessName(meData.user.businessName);
        }
        const linksData = await linksRes.json() as { links?: unknown[] };
        const productsData = await productsRes.json() as { products?: unknown[] };
        const announcementsData = await announcementsRes.json() as { announcements?: unknown[] };
        setStats({
          links: linksData.links?.length || 0,
          products: productsData.products?.length || 0,
          announcements: announcementsData.announcements?.length || 0,
        });
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(`https://${subdomain}.onnepal.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  const siteUrl = `https://${subdomain}.onnepal.com`;
  const totalItems = stats.links + stats.products + stats.announcements;

  return (
    <div className="space-y-8">
      {/* Welcome + Site URL */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <p className="text-gray-400 text-sm">Welcome back</p>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">{businessName}</h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3.5 py-2 flex-1 min-w-0">
              <span className="text-sm font-mono text-indigo-300 truncate">{subdomain}.onnepal.com</span>
            </div>
            <button
              onClick={copyUrl}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-gray-300 hover:text-white transition-colors flex-shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
              <Button size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-1.5">
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Your content</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: '/dashboard/links', icon: LinkIcon, label: 'Social Links', count: stats.links, color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-100' },
            { href: '/dashboard/products', icon: ShoppingBag, label: 'Products', count: stats.products, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
            { href: '/dashboard/announcements', icon: Megaphone, label: 'Announcements', count: stats.announcements, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="group relative p-5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
                <div className={`w-10 h-10 rounded-xl ${item.bg} ring-1 ${item.ring} flex items-center justify-center mb-3`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-500 mt-0.5">{item.label}</p>
                <ArrowRight className="absolute top-5 right-5 h-4 w-4 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick actions</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link href="/dashboard/links">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Add social links</p>
                <p className="text-xs text-gray-400">Facebook, Instagram, WhatsApp...</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
            </div>
          </Link>
          <Link href="/dashboard/products">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Add products</p>
                <p className="text-xs text-gray-400">Showcase what you offer</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-400 transition-colors" />
            </div>
          </Link>
          <Link href="/dashboard/announcements">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-amber-200 hover:bg-amber-50/30 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Megaphone className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Post announcement</p>
                <p className="text-xs text-gray-400">News, offers, updates</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-amber-400 transition-colors" />
            </div>
          </Link>
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-violet-200 hover:bg-violet-50/30 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                <Settings className="h-4 w-4 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Edit settings</p>
                <p className="text-xs text-gray-400">Profile, theme, contact info</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-violet-400 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Tip */}
      {subdomain && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
          <TrendingUp className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-900">Grow your reach</p>
            <p className="text-sm text-indigo-700/70 mt-0.5 leading-relaxed">
              Share <span className="font-mono font-semibold text-indigo-800">{subdomain}.onnepal.com</span> on social media, WhatsApp, and business cards to drive traffic.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
