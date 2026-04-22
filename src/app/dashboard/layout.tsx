'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, LinkIcon, ShoppingBag, Megaphone, Settings, Eye, Loader2,
  Plus, ChevronDown, Check,
} from 'lucide-react';
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

interface UserData {
  id: string;
  email: string;
  displayName: string | null;
}

interface DashboardContextType {
  user: UserData | null;
  business: Business | null;
  businesses: Business[];
  setBusiness: (b: Business) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  user: null,
  business: null,
  businesses: [],
  setBusiness: () => {},
});

export function useActiveBusiness() {
  return useContext(DashboardContext);
}

const BUSINESS_TABS = [
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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json() as { user: UserData; businesses: Business[] };
        setUser(data.user);
        setBusinesses(data.businesses);

        if (data.businesses.length > 0) {
          const savedId = typeof window !== 'undefined' ? localStorage.getItem('activeBusinessId') : null;
          const saved = savedId ? data.businesses.find((b) => b.id === savedId) : null;
          setActiveBusiness(saved || data.businesses[0]);
        }
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) return null;

  const hasBusiness = activeBusiness !== null;
  const isOverview = pathname === '/dashboard';

  return (
    <DashboardContext.Provider value={{ user, business: activeBusiness, businesses, setBusiness: switchBusiness }}>
      <div className="min-h-screen bg-white">
        {/* Top bar — only show business chrome when a business is selected and not on overview */}
        {hasBusiness && (
          <div className="border-b border-gray-100 sticky top-14 z-40 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-12">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 min-w-0 hover:bg-gray-50 rounded-lg px-2 py-1 -ml-2 transition-colors">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: activeBusiness.primaryColor || '#1e293b' }}
                      >
                        {activeBusiness.businessName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-950 truncate">{activeBusiness.businessName}</span>
                      {businesses.length > 1 && <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {businesses.map((b) => (
                      <DropdownMenuItem key={b.id} onClick={() => switchBusiness(b)} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                          style={{ backgroundColor: b.primaryColor || '#1e293b' }}>
                          {b.businessName.charAt(0)}
                        </div>
                        <span className="text-sm truncate flex-1">{b.businessName}</span>
                        {b.id === activeBusiness.id && <Check className="h-3.5 w-3.5 text-gray-950 flex-shrink-0" />}
                      </DropdownMenuItem>
                    ))}
                    {businesses.length < 5 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/create-business')}>
                          <Plus className="h-4 w-4 mr-2 text-gray-400" /> Add business
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <a href={`https://${activeBusiness.subdomain}.onnepal.com`} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-gray-950 transition-colors flex items-center gap-1">
                  {activeBusiness.subdomain}.onnepal.com
                  <Eye className="h-3 w-3" />
                </a>
              </div>

              {/* Tabs */}
              <div className="-mb-px flex gap-0.5 overflow-x-auto scrollbar-none">
                {BUSINESS_TABS.map((tab) => {
                  const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
                  return (
                    <Link key={tab.href} href={tab.href}
                      className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                        isActive ? 'border-gray-950 text-gray-950' : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}>
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
