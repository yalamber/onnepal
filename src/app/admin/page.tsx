'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Tag, Users, Loader2 } from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, businesses: 0, classifieds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [u, b, c] = await Promise.all([
          fetch('/api/admin/users').then(r => r.json()) as Promise<{ total: number }>,
          fetch('/api/admin/businesses').then(r => r.json()) as Promise<{ total: number }>,
          fetch('/api/admin/classifieds').then(r => r.json()) as Promise<{ total: number }>,
        ]);
        setStats({ users: u.total, businesses: b.total, classifieds: c.total });
      } catch {}
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Admin panel</h1>
        <p className="mt-1 text-gray-400">Moderate businesses, classifieds, and users.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Users', count: stats.users, href: '/admin/users', icon: Users },
          { label: 'Businesses', count: stats.businesses, href: '/admin/businesses', icon: Building2 },
          { label: 'Classifieds', count: stats.classifieds, href: '/admin/classifieds', icon: Tag },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="p-5 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors cursor-pointer">
            <item.icon className="h-5 w-5 text-gray-400 mb-3" />
            <p className="text-3xl font-bold text-gray-950">{item.count}</p>
            <p className="text-sm text-gray-400 mt-1">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
