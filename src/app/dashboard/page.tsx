'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink, LinkIcon, Megaphone, ShoppingBag, ArrowRight, Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ links: 0, products: 0, announcements: 0 });
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(true);

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
          const meData = await meRes.json() as { user: { subdomain: string } };
          setSubdomain(meData.user.subdomain);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  const siteUrl = `https://${subdomain}.onnepal.com`;

  return (
    <div className="space-y-6">
      {/* Site URL card */}
      {subdomain && (
        <div className="p-5 rounded-2xl bg-gray-950 shadow-lg">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Your page is live</p>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-mono font-bold text-white hover:text-indigo-300 flex items-center gap-2 transition-colors"
          >
            {subdomain}.onnepal.com
            <ExternalLink className="h-4 w-4 text-gray-500" />
          </a>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: '/dashboard/links', icon: LinkIcon, label: 'Links', count: stats.links, color: 'bg-indigo-50 text-indigo-600' },
          { href: '/dashboard/products', icon: ShoppingBag, label: 'Products', count: stats.products, color: 'bg-emerald-50 text-emerald-600' },
          { href: '/dashboard/announcements', icon: Megaphone, label: 'News', count: stats.announcements, color: 'bg-amber-50 text-amber-600' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.count} {item.count === 1 ? 'item' : 'items'}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Tip */}
      {subdomain && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
          <p className="text-sm text-indigo-700 leading-relaxed">
            Share <span className="font-mono font-semibold">{subdomain}.onnepal.com</span> on social media, WhatsApp, and business cards.
          </p>
        </div>
      )}
    </div>
  );
}
