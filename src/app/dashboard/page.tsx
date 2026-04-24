'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Loader2, Tag, MapPin, Eye, Settings, LinkIcon, ShoppingBag, Megaphone, Copy, Check } from 'lucide-react';
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

  const copyUrl = async () => {
    if (!business) return;
    await navigator.clipboard.writeText(`https://${business.subdomain}.onnepal.com`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight">
          {user?.displayName ? `Hi, ${user.displayName}` : 'Dashboard'}
        </h1>
        <p className="mt-1 text-gray-400">Manage your business page and classified ads.</p>
      </div>

      {/* Active business card */}
      {business ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Business header bar */}
          <div className="bg-gray-950 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: business.primaryColor || '#4f46e5' }}>
                {business.businessName.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{business.businessName}</p>
                <p className="text-gray-400 text-xs truncate">{business.subdomain}.onnepal.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={copyUrl}
                className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer" title="Copy URL">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
              <a href={`https://${business.subdomain}.onnepal.com`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors">
                <Eye className="h-3.5 w-3.5" /> View page
              </a>
            </div>
          </div>

          {/* Quick stats + actions */}
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              <Link href="/dashboard/links" className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-950">{stats.links}</p>
                  <LinkIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Links</p>
              </Link>
              <Link href="/dashboard/products" className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-950">{stats.products}</p>
                  <ShoppingBag className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Products</p>
              </Link>
              <Link href="/dashboard/announcements" className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-950">{stats.announcements}</p>
                  <Megaphone className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Announcements</p>
              </Link>
            </div>

            <div className="flex gap-2">
              <Link href="/dashboard/settings"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-950 transition-colors">
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
              <Link href="/dashboard/qr-sticker"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-950 transition-colors">
                QR Code
              </Link>
              {!business.isPublished && (
                <span className="flex items-center px-3 py-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg">
                  Not published
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-200 rounded-lg py-12 text-center">
          <p className="text-sm text-gray-400 mb-4">You haven&apos;t created any businesses yet.</p>
          <Link href="/create-business" className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
            Create your first business
          </Link>
        </div>
      )}

      {/* Other businesses */}
      {businesses.length > 1 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-950 mb-3">Other businesses</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {businesses.filter(b => b.id !== business?.id).map((b) => (
              <button key={b.id} onClick={() => setBusiness(b)}
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors text-left cursor-pointer">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
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
