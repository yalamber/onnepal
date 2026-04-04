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
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!user) return null;

  const siteUrl = `https://${user.subdomain}.onnepal.com`;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 animate-fade-in">
        <div>
          <h1 className="text-[1.5rem] font-bold text-neutral-950 tracking-[-0.025em] leading-[1.2]">Dashboard</h1>
          <p className="text-neutral-400 text-[0.8125rem] mt-1">{user.businessName}</p>
        </div>
        <a href={siteUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
            View site
          </Button>
        </a>
      </div>

      {/* Site URL */}
      <div className="mb-10 p-6 rounded-2xl bg-neutral-950 animate-fade-in-up delay-100">
        <p className="text-neutral-500 text-[0.6875rem] font-medium uppercase tracking-[0.08em] mb-2">Your page</p>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-mono font-bold text-white hover:underline flex items-center gap-2"
        >
          {user.subdomain}.onnepal.com
          <ExternalLink className="h-4 w-4 text-neutral-500" />
        </a>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-3 mb-10">
        {[
          { href: '/dashboard/links', icon: LinkIcon, label: 'Links', count: stats.links, desc: 'Social profiles' },
          { href: '/dashboard/products', icon: ShoppingBag, label: 'Products', count: stats.products, desc: 'Items & services' },
          { href: '/dashboard/announcements', icon: Megaphone, label: 'Announcements', count: stats.announcements, desc: 'News & updates' },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings', count: null, desc: 'Profile & brand' },
        ].map((item, i) => (
          <Link key={item.href} href={item.href}>
            <div
              className="group flex items-center gap-4 p-5 rounded-2xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all duration-200 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${(i + 2) * 80}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 flex items-center justify-center transition-all duration-200">
                <item.icon className="h-5 w-5 text-neutral-500 group-hover:text-white transition-colors duration-200" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-950">{item.label}</p>
                <p className="text-xs text-neutral-400">{item.desc}</p>
              </div>
              {item.count !== null && (
                <span className="text-lg font-bold text-neutral-950">{item.count}</span>
              )}
              <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Tip */}
      <p className="text-center text-sm text-neutral-400 animate-fade-in delay-500">
        Share <span className="font-mono text-neutral-600">{user.subdomain}.onnepal.com</span> on social media and business cards
      </p>
    </div>
  );
}
