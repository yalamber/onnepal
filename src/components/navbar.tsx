'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LayoutDashboard, LogOut, ExternalLink, ChevronDown, Search, Tag } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  displayName: string | null;
}

export function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isSitePage = pathname.startsWith('/site/');
  const isHomePage = pathname === '/';

  useEffect(() => {
    if (isSitePage) return;
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json() as { user: UserData; businesses: unknown[] };
          setUser(data.user);
        }
      } catch {}
    };

    fetchUser();
    const handleAuthChange = () => fetchUser();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [isSitePage]);

  if (isSitePage) return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  // Minimal navbar on homepage — just logo + directory + login
  if (isHomePage && !user) {
    return (
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-[0.6rem] font-bold tracking-tight">ON</span>
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">OnNepal</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/directory" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
                <Search className="h-3.5 w-3.5" />
                Directory
              </Link>
              <Link href="/classifieds" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Classifieds
              </Link>
              <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-[0.6rem] font-bold tracking-tight">ON</span>
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">OnNepal</span>
            </Link>
            <Link
              href="/directory"
              className={`hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/directory')
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              Directory
            </Link>
            <Link
              href="/classifieds"
              className={`hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/classifieds')
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              Classifieds
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                      {user.displayName || user.email}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-1 mt-8">
                  <Link href="/directory" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-2 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                    <Search className="h-4 w-4" /> Browse Directory
                  </Link>
                  <Link href="/classifieds" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-2 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                    <Tag className="h-4 w-4" /> Classifieds
                  </Link>
                  <div className="h-px bg-slate-100 my-2" />
                  {user ? (
                    <>
                      <p className="text-sm font-medium px-2 text-slate-900">{user.displayName || user.email}</p>
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-2 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2 px-2 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="px-2 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">Log in</Link>
                      <Link href="/signup" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
