'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ExternalLink, LinkIcon, Megaphone, ShoppingBag, Settings,
  Eye, Loader2, MousePointer
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
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data: { user: UserData } = await res.json();
        if (data.user.onboardingStep < 4) {
          router.push('/onboarding');
          return;
        }
        setUser(data.user);

        // Fetch counts
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
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) return null;

  const siteUrl = `https://${user.subdomain}.onnepal.com`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{user.businessName}</p>
        </div>
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            View site
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>

      {/* Site URL card */}
      <Card className="mb-8 bg-gray-950 text-white border-0 animate-fade-in-up animation-delay-100">
        <CardContent className="py-6">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1.5">Your page is live at</p>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-mono font-bold hover:underline flex items-center gap-2"
          >
            {user.subdomain}.onnepal.com
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { href: '/dashboard/links', icon: LinkIcon, label: 'Links', count: stats.links },
          { href: '/dashboard/products', icon: ShoppingBag, label: 'Products', count: stats.products },
          { href: '/dashboard/announcements', icon: Megaphone, label: 'Announcements', count: stats.announcements },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings', count: null },
        ].map((item, i) => (
          <Link key={item.href} href={item.href}>
            <Card className={`group hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer h-full animate-fade-in-up`} style={{ animationDelay: `${(i + 2) * 100}ms` }}>
              <CardContent className="py-5 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors duration-200">
                  <item.icon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600 transition-colors duration-200" />
                </div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                {item.count !== null && (
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{item.count}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick tips */}
      <Card className="animate-fade-in animation-delay-500">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Quick tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>Add your social links to help customers find you on every platform</li>
            <li>Upload products to showcase what you offer</li>
            <li>Post announcements to keep customers updated about offers and events</li>
            <li>Share your link <span className="font-mono text-indigo-600 text-xs">{user.subdomain}.onnepal.com</span> on social media and business cards</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
