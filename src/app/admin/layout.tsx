'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Tag, Users, LayoutDashboard, Loader2, Shield, Feather } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/businesses', label: 'Businesses', icon: Building2, exact: false },
  { href: '/admin/classifieds', label: 'Classifieds', icon: Tag, exact: false },
  { href: '/admin/voices', label: 'Voices', icon: Feather, exact: false },
  { href: '/admin/users', label: 'Users', icon: Users, exact: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json() as { user: { isAdmin?: boolean } };
        if (!data.user.isAdmin) { router.push('/dashboard'); return; }
        setAuthorized(true);
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    };
    check();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-10">
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-950">Admin</p>
            </div>
            <nav className="space-y-0.5">
              {NAV.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                      isActive ? 'bg-gray-100 text-gray-950 font-medium' : 'text-gray-500 hover:text-gray-950'
                    }`}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">&larr; Dashboard</Link>
            </div>
          </aside>

          {/* Mobile tabs */}
          <div className="lg:hidden w-full -mt-4 mb-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-gray-100 pb-2">
              {NAV.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex-shrink-0 px-3 py-1.5 rounded text-sm transition-colors ${
                      isActive ? 'bg-gray-950 text-white' : 'text-gray-400 hover:text-gray-950'
                    }`}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
