'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, LinkIcon, ShoppingBag, Megaphone, Settings, Eye, Loader2,
  Plus, ChevronDown, Check, Tag, Building2, User, QrCode,
  UtensilsCrossed, Gift, Image, Star, Users, HelpCircle, Calendar,
  ChevronsUpDown, LogOut, Briefcase, AlertTriangle, CalendarPlus,
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
  enabledModules: string | null;
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
  user: null, business: null, businesses: [], setBusiness: () => {},
});

export function useActiveBusiness() {
  return useContext(DashboardContext);
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/links', label: 'Links', icon: LinkIcon, exact: false },
  { href: '/dashboard/products', label: 'Products', icon: ShoppingBag, exact: false },
  { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed, exact: false },
  { href: '/dashboard/gallery', label: 'Gallery', icon: Image, exact: false },
  { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone, exact: false },
  { href: '/dashboard/offers', label: 'Offers', icon: Gift, exact: false },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star, exact: false },
  { href: '/dashboard/team', label: 'Team', icon: Users, exact: false },
  { href: '/dashboard/faq', label: 'FAQ', icon: HelpCircle, exact: false },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Calendar, exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false },
  { href: '/dashboard/qr-sticker', label: 'QR Sticker', icon: QrCode, exact: false },
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  }

  if (!user) return null;

  return (
    <DashboardContext.Provider value={{ user, business: activeBusiness, businesses, setBusiness: switchBusiness }}>
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-10">
            {/* Sidebar */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
              {/* Business switcher — top, prominent */}
              {activeBusiness ? (
                <div className="mb-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2.5 w-full text-left border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer transition-colors">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: activeBusiness.primaryColor || '#1e293b' }}>
                          {activeBusiness.businessName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-950 truncate">{activeBusiness.businessName}</p>
                          <p className="text-[11px] text-gray-400 truncate">{activeBusiness.subdomain}.onnepal.com</p>
                        </div>
                        <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
                      <div className="px-2 py-1.5 mb-1">
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Switch business</p>
                      </div>
                      {businesses.map((b) => (
                        <DropdownMenuItem key={b.id} onClick={() => switchBusiness(b)} className="flex items-center gap-2.5 cursor-pointer rounded-md px-2 py-2">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: b.primaryColor || '#1e293b' }}>
                            {b.businessName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{b.businessName}</p>
                            <p className="text-[11px] text-gray-400 truncate">{b.subdomain}.onnepal.com</p>
                          </div>
                          {b.id === activeBusiness.id && <Check className="h-3.5 w-3.5 text-gray-950 flex-shrink-0" />}
                        </DropdownMenuItem>
                      ))}
                      {businesses.length < 5 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push('/create-business')} className="cursor-pointer rounded-md px-2 py-2">
                            <Plus className="h-4 w-4 mr-2 text-gray-400" /> Add business
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <a href={`https://${activeBusiness.subdomain}.onnepal.com`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-950 mt-2 ml-1 transition-colors">
                    <Eye className="h-3 w-3" /> View live page
                  </a>
                </div>
              ) : (
                <div className="mb-6">
                  <Link href="/create-business"
                    className="flex items-center gap-2 w-full border border-dashed border-gray-200 hover:border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-500 hover:text-gray-950 transition-colors">
                    <Plus className="h-4 w-4" /> Create a business
                  </Link>
                </div>
              )}

              {/* Overview */}
              <nav className="space-y-0.5">
                <Link href="/dashboard"
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                    pathname === '/dashboard' ? 'bg-gray-100 text-gray-950 font-medium' : 'text-gray-500 hover:text-gray-950'
                  }`}>
                  <LayoutDashboard className="h-4 w-4" /> Overview
                </Link>
              </nav>

              {/* Business management */}
              {activeBusiness && (
                <div className="mt-5">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 px-2">Business</p>
                  <nav className="space-y-0.5">
                    {NAV_ITEMS.filter(i => !i.exact).map((item) => {
                      const isActive = pathname.startsWith(item.href);
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
                </div>
              )}

              {/* Create */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 px-2">Create</p>
                <nav className="space-y-0.5">
                  <Link href="/classifieds/post/new" className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-500 hover:text-gray-950 transition-colors">
                    <Tag className="h-4 w-4" /> Post ad
                  </Link>
                  <Link href="/jobs/post/new" className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-500 hover:text-gray-950 transition-colors">
                    <Briefcase className="h-4 w-4" /> Post job
                  </Link>
                  <Link href="/events/post/new" className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-500 hover:text-gray-950 transition-colors">
                    <CalendarPlus className="h-4 w-4" /> Post event
                  </Link>
                  <Link href="/lost-found/post/new" className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-500 hover:text-gray-950 transition-colors">
                    <AlertTriangle className="h-4 w-4" /> Report item
                  </Link>
                </nav>
              </div>

              {/* Account */}
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-0.5">
                <Link href="/dashboard/account" className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                  pathname === '/dashboard/account' ? 'bg-gray-100 text-gray-950 font-medium' : 'text-gray-500 hover:text-gray-950'
                }`}>
                  <User className="h-4 w-4" /> Account
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-gray-500 hover:text-gray-950 transition-colors w-full cursor-pointer">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </aside>

            {/* Mobile header */}
            <div className="lg:hidden w-full -mt-4 mb-4 space-y-3">
              {/* Mobile business switcher */}
              {activeBusiness && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: activeBusiness.primaryColor || '#1e293b' }}>
                        {activeBusiness.businessName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-gray-950 truncate">{activeBusiness.businessName}</p>
                      </div>
                      <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
                    {businesses.map((b) => (
                      <DropdownMenuItem key={b.id} onClick={() => switchBusiness(b)} className="flex items-center gap-2.5 cursor-pointer rounded-md px-2 py-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ backgroundColor: b.primaryColor || '#1e293b' }}>
                          {b.businessName.charAt(0)}
                        </div>
                        <span className="text-sm truncate flex-1">{b.businessName}</span>
                        {b.id === activeBusiness.id && <Check className="h-3.5 w-3.5 text-gray-950" />}
                      </DropdownMenuItem>
                    ))}
                    {businesses.length < 5 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/create-business')} className="cursor-pointer rounded-md">
                          <Plus className="h-4 w-4 mr-2 text-gray-400" /> Add business
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile nav tabs */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-gray-100 pb-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  const needsBusiness = item.href !== '/dashboard';
                  if (needsBusiness && !activeBusiness) return null;
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

            {/* Content */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
