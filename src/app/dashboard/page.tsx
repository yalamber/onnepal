'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ExternalLink, LinkIcon, Megaphone, ShoppingBag, Settings,
  Eye, Loader2, ArrowRight
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  subdomain: string | null;
  businessName: string | null;
  isPublished: boolean;
  onboardingStep: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ links: 0, products: 0, announcements: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data: { user: UserData } = await res.json();
        if (data.user.onboardingStep < 4) { router.push('/onboarding'); return; }
        setUser(data.user);

        const [linksRes, productsRes, announcementsRes] = await Promise.all([
          fetch('/api/business/links'),
          fetch('/api/business/products'),
          fetch('/api/business/announcements'),
        ]);
        const linksData = await linksRes.json() as { links?: unknown[] };
        const productsData = await productsRes.json() as { products?: unknown[] };
        const announcementsData = await announcementsRes.json() as { announcements?: unknown[] };
        setStats({
          links: linksData.links?.length || 0,
          products: productsData.products?.length || 0,
          announcements: announcementsData.announcements?.length || 0,
        });
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return null;
  const siteUrl = `https://${user.subdomain}.onnepal.com`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-[1.2]">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">{user.businessName}</p>
        </div>
        <a href={siteUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" /> View site
          </Button>
        </a>
      </div>

      {/* Site URL */}
      <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg animate-fade-in-up delay-100">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.08em] mb-2">Your page is live</p>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-mono font-bold text-white hover:text-blue-300 flex items-center gap-2 transition-colors"
        >
          {user.subdomain}.onnepal.com
          <ExternalLink className="h-4 w-4 text-slate-500" />
        </a>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {[
          { href: '/dashboard/links', icon: LinkIcon, label: 'Links', count: stats.links, desc: 'Social profiles', color: 'bg-blue-50 text-blue-600' },
          { href: '/dashboard/products', icon: ShoppingBag, label: 'Products', count: stats.products, desc: 'Items & services', color: 'bg-emerald-50 text-emerald-600' },
          { href: '/dashboard/announcements', icon: Megaphone, label: 'Announcements', count: stats.announcements, desc: 'News & updates', color: 'bg-amber-50 text-amber-600' },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings', count: null, desc: 'Profile & theme', color: 'bg-violet-50 text-violet-600' },
        ].map((item, i) => (
          <Link key={item.href} href={item.href}>
            <div
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${(i + 2) * 80}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              {item.count !== null && (
                <span className="text-lg font-bold text-slate-900">{item.count}</span>
              )}
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Tip */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 animate-fade-in delay-500">
        <p className="text-sm text-blue-700 leading-[1.6]">
          Share <span className="font-mono font-semibold">{user.subdomain}.onnepal.com</span> on social media, WhatsApp, and business cards to drive visitors to your page.
        </p>
      </div>
    </div>
  );
}
