'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, LinkIcon, ShoppingBag, Megaphone, Settings, Eye, ExternalLink, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserData {
  id: string;
  email: string;
  subdomain: string | null;
  businessName: string | null;
  isPublished: boolean;
  onboardingStep: number;
}

const TABS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/links', label: 'Links', icon: LinkIcon, exact: false },
  { href: '/dashboard/products', label: 'Products', icon: ShoppingBag, exact: false },
  { href: '/dashboard/announcements', label: 'News', icon: Megaphone, exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data: { user: UserData } = await res.json();
        if (data.user.onboardingStep < 4) { router.push('/onboarding'); return; }
        setUser(data.user);
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  const siteUrl = `https://${user.subdomain}.onnepal.com`;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header row */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">{user.businessName}</h1>
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 font-mono transition-colors"
              >
                {user.subdomain}.onnepal.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Eye className="h-3.5 w-3.5" /> View site
              </Button>
            </a>
          </div>

          {/* Tab bar */}
          <div className="-mb-px flex gap-1 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const isActive = tab.exact
                ? pathname === tab.href
                : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </div>
    </div>
  );
}
