'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Loader2, Tag, MapPin } from 'lucide-react';
import { useActiveBusiness } from './layout';

interface ClassifiedAd {
  id: string;
  title: string;
  price: string | null;
  category: string;
  location: string | null;
  status: string;
  createdAt: string;
}

function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  return 'just now';
}

export default function DashboardPage() {
  const { user, business, businesses } = useActiveBusiness();
  const [classifieds, setClassifieds] = useState<ClassifiedAd[]>([]);
  const [stats, setStats] = useState({ links: 0, products: 0, announcements: 0 });
  const [loading, setLoading] = useState(true);

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
          setStats({
            links: l.links?.length || 0,
            products: p.products?.length || 0,
            announcements: a.announcements?.length || 0,
          });
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, [business]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
          {user?.displayName ? `Hi, ${user.displayName}` : 'Dashboard'}
        </h1>
        <p className="mt-1 text-gray-400">Manage your businesses and classified ads.</p>
      </div>

      {/* Businesses */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-950">Your businesses</h2>
          {businesses.length < 5 && (
            <Link href="/create-business" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
              Add business &rarr;
            </Link>
          )}
        </div>

        {businesses.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg py-12 text-center">
            <p className="text-sm text-gray-400 mb-4">You haven&apos;t created any businesses yet.</p>
            <Link href="/create-business" className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Create your first business
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {businesses.map((b) => (
              <div key={b.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: b.primaryColor || '#1e293b' }}>
                    {b.businessName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-950 truncate">{b.businessName}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{b.subdomain}.onnepal.com</p>
                    {b.businessCategory && <p className="text-xs text-gray-300 mt-1">{b.businessCategory}</p>}
                  </div>
                </div>
                <a href={`https://${b.subdomain}.onnepal.com`} target="_blank" rel="noopener noreferrer"
                  className="text-gray-300 hover:text-gray-950 transition-colors flex-shrink-0 mt-1">
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            ))}
            {businesses.length < 5 && (
              <Link href="/create-business"
                className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:text-gray-950 hover:border-gray-300 transition-colors">
                <Plus className="h-4 w-4" /> Add business
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Active business stats */}
      {business && (
        <div>
          <h2 className="text-sm font-semibold text-gray-950 mb-4">
            {business.businessName} &mdash; content
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/dashboard/links" className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
              <p className="text-2xl font-bold text-gray-950">{stats.links}</p>
              <p className="text-xs text-gray-400 mt-1">Links</p>
            </Link>
            <Link href="/dashboard/products" className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
              <p className="text-2xl font-bold text-gray-950">{stats.products}</p>
              <p className="text-xs text-gray-400 mt-1">Products</p>
            </Link>
            <Link href="/dashboard/announcements" className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
              <p className="text-2xl font-bold text-gray-950">{stats.announcements}</p>
              <p className="text-xs text-gray-400 mt-1">Announcements</p>
            </Link>
          </div>
        </div>
      )}

      {/* Classifieds */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-950">Your classified ads</h2>
          <Link href="/classifieds/post/new" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">
            Post ad &rarr;
          </Link>
        </div>

        {classifieds.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-lg py-12 text-center">
            <p className="text-sm text-gray-400 mb-4">No classified ads yet.</p>
            <Link href="/classifieds/post/new" className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Post your first ad
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {classifieds.map((ad) => (
              <Link key={ad.id} href={`/classifieds/post/${ad.id}`} className="flex items-center justify-between py-3 group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-950 group-hover:underline truncate">{ad.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{ad.category}</span>
                    {ad.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ad.location}</span>}
                    <span>{timeAgo(ad.createdAt)}</span>
                  </div>
                </div>
                {ad.price && <p className="text-sm font-medium text-gray-950 flex-shrink-0 ml-4">{ad.price}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
