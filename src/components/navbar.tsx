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
import { Menu, LayoutDashboard, LogOut, ChevronDown, Settings } from 'lucide-react';

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

  useEffect(() => {
    if (isSitePage) return;
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json() as { user: UserData };
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

  const navLinks = [
    { href: '/directory', label: 'Directory' },
    { href: '/classifieds', label: 'Classifieds' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-gray-950 tracking-tight">
              OnNepal
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    pathname.startsWith(link.href)
                      ? 'text-gray-950 font-medium'
                      : 'text-gray-400 hover:text-gray-950'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-1">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-950 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                    {user.displayName || user.email}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer rounded-md px-3 py-2 text-sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/account')} className="cursor-pointer rounded-md px-3 py-2 text-sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Account settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-md px-3 py-2 text-sm text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-400 hover:text-gray-950 transition-colors px-3 py-1.5">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm text-white bg-gray-950 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="sm:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="p-1.5 text-gray-400">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-1 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 text-sm text-gray-600 hover:text-gray-950 rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="h-px bg-gray-100 my-3" />
                  {user ? (
                    <>
                      <p className="px-3 text-sm font-medium text-gray-950">{user.displayName || user.email}</p>
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-gray-600 hover:text-gray-950 rounded-lg transition-colors">
                        Dashboard
                      </Link>
                      <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-3 py-2.5 text-sm text-left text-red-500 hover:text-red-600 rounded-lg transition-colors">
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-gray-600 hover:text-gray-950 rounded-lg transition-colors">
                        Log in
                      </Link>
                      <Link href="/signup" onClick={() => setMobileOpen(false)} className="mx-3 mt-1 text-center py-2.5 text-sm text-white bg-gray-950 rounded-lg">
                        Sign up
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
