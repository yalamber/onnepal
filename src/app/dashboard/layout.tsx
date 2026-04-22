'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, LinkIcon, ShoppingBag, Megaphone, Settings, Eye, ExternalLink, Loader2,
  Plus, ChevronDown, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Business {
  id: string;
  subdomain: string;
  businessName: string;
  businessCategory: string | null;
  isPublished: boolean;
  primaryColor: string | null;
  accentColor: string | null;
}

interface BusinessContextType {
  business: Business | null;
  businesses: Business[];
  setBusiness: (b: Business) => void;
}

const BusinessContext = createContext<BusinessContextType>({
  business: null,
  businesses: [],
  setBusiness: () => {},
});

export function useActiveBusiness() {
  return useContext(BusinessContext);
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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json() as { user: { id: string }; businesses: Business[] };

        if (data.businesses.length === 0) {
          router.push('/create-business');
          return;
        }

        setBusinesses(data.businesses);
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('activeBusinessId') : null;
        const saved = savedId ? data.businesses.find((b: Business) => b.id === savedId) : null;
        setActiveBusiness(saved || data.businesses[0]);
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  const switchBusiness = (b: Business) => {
    setActiveBusiness(b);
    if (typeof window !== 'undefined') localStorage.setItem('activeBusinessId', b.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!activeBusiness) return null;

  const siteUrl = `https://${activeBusiness.subdomain}.onnepal.com`;

  return (
    <BusinessContext.Provider value={{ business: activeBusiness, businesses, setBusiness: switchBusiness }}>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 sticky top-14 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header row */}
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3 min-w-0">
                {/* Business switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 min-w-0 hover:bg-gray-50 rounded-lg px-2 py-1 -ml-2 transition-colors">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${activeBusiness.primaryColor || '#6366f1'}, ${activeBusiness.accentColor || '#8b5cf6'})`,
                        }}
                      >
                        {activeBusiness.businessName.charAt(0)}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-bold text-gray-900 truncate">{activeBusiness.businessName}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{activeBusiness.subdomain}.onnepal.com</p>
                      </div>
                      {businesses.length > 1 && <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />}
                    </button>
                  </DropdownMenuTrigger>
                  {businesses.length > 1 && (
                    <DropdownMenuContent align="start" className="w-64">
                      {businesses.map((b) => (
                        <DropdownMenuItem key={b.id} onClick={() => switchBusiness(b)} className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${b.primaryColor || '#6366f1'}, ${b.accentColor || '#8b5cf6'})` }}
                          >
                            {b.businessName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{b.businessName}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{b.subdomain}.onnepal.com</p>
                          </div>
                          {b.id === activeBusiness.id && <Check className="h-4 w-4 text-indigo-600 flex-shrink-0" />}
                        </DropdownMenuItem>
                      ))}
                      {businesses.length < 5 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push('/create-business')}>
                            <Plus className="h-4 w-4 mr-2 text-gray-400" />
                            Add business
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </div>
              <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-gray-200">
                  <Eye className="h-3.5 w-3.5" /> View site
                </Button>
              </a>
            </div>

            {/* Tab bar */}
            <div className="-mb-px flex gap-0.5 overflow-x-auto scrollbar-none">
              {TABS.map((tab) => {
                const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                      isActive
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </BusinessContext.Provider>
  );
}
