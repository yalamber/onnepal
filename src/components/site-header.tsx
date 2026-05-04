'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Mail, Bell, Plus, Menu, X, MapPin, ChevronDown, Check,
  ArrowRight, LayoutDashboard, LogOut, Settings, Shield, User, Bookmark, Loader2,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserData {
  id: string;
  email: string;
  username?: string;
  displayName: string | null;
  isAdmin?: boolean;
}

const NAV_LINKS = [
  { href: '/directory', label: 'Directory' },
  { href: '/classifieds', label: 'Classifieds' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/events', label: 'Events' },
  { href: '/places', label: 'Places' },
  { href: '/pros', label: 'Pros' },
  { href: '/lost-found', label: 'Lost & Found' },
  { href: '/discussions', label: 'Discussions' },
];

const CITIES = [
  { name: 'Kathmandu', sub: 'Capital · 1.4M' },
  { name: 'Lalitpur', sub: 'Patan · 230k' },
  { name: 'Bhaktapur', sub: 'Heritage · 110k' },
  { name: 'Pokhara', sub: 'Lakeside · 480k' },
  { name: 'Chitwan', sub: 'Bharatpur · 320k' },
  { name: 'Biratnagar', sub: 'East · 240k' },
  { name: 'Butwal', sub: 'West · 138k' },
  { name: 'Janakpur', sub: 'Mithila · 158k' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isSitePage = pathname.startsWith('/site/');
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const [user, setUser] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [city, setCity] = useState('Kathmandu');
  const [cityQuery, setCityQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(NAV_LINKS.length);

  const navRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSitePage || isAuthPage) {
      setAuthLoading(false);
      return;
    }
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!cancelled && res.ok) {
          const data = (await res.json()) as { user: UserData };
          setUser(data.user);
        }
      } catch {}
      finally { if (!cancelled) setAuthLoading(false); }
    };
    fetchUser();
    const onAuth = () => fetchUser();
    window.addEventListener('auth-change', onAuth);
    return () => { cancelled = true; window.removeEventListener('auth-change', onAuth); };
  }, [isSitePage, isAuthPage]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('onnepal-city') : null;
    if (stored) setCity(stored);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!moreOpen && !cityOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreOpen && moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (cityOpen && cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMoreOpen(false); setCityOpen(false); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen, cityOpen]);

  useEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      if (!nav) return;
      const available = nav.clientWidth;
      const items = nav.querySelectorAll<HTMLElement>('[data-nav-measure]');
      const moreBtnWidth = 86;
      let used = 0, count = 0, total = 0;
      items.forEach((el) => {
        const w = el.scrollWidth + 4;
        total += w;
        if (used + w <= available - moreBtnWidth) { used += w; count += 1; }
      });
      if (total <= available) count = NAV_LINKS.length;
      setVisibleCount(Math.max(1, count));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  if (isSitePage) return null;

  const handleNav = (href: string) => {
    setMenuOpen(false);
    setMoreOpen(false);
    router.push(href);
  };

  const handleCityPick = (name: string) => {
    setCity(name);
    setCityOpen(false);
    setCityQuery('');
    if (typeof window !== 'undefined') localStorage.setItem('onnepal-city', name);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  const visible = NAV_LINKS.slice(0, visibleCount);
  const overflow = NAV_LINKS.slice(visibleCount);
  const filteredCities = CITIES.filter((c) =>
    c.name.toLowerCase().includes(cityQuery.toLowerCase()),
  );
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="onnepal-header">
      <div className="header-bar">
        <div className="header-left">
          <Link href="/" aria-label="OnNepal — home" className="inline-flex items-center" style={{ flexShrink: 0 }}>
            <Logo className="h-8" />
          </Link>
          <div className="city-selector" ref={cityRef}>
            <button
              className="loc-pill"
              onClick={() => setCityOpen((o) => !o)}
              aria-expanded={cityOpen}
              aria-haspopup="listbox"
              type="button"
            >
              <MapPin />
              <span className="loc-pill-name">{city}</span>
              <span className="loc-sep">·</span>
              <span className="loc-sub">Nepal</span>
              <ChevronDown
                size={12}
                style={{
                  marginLeft: 2,
                  opacity: 0.6,
                  transform: cityOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform var(--dur-1) var(--ease)',
                }}
              />
            </button>
            {cityOpen && (
              <div className="city-menu" role="listbox">
                <div className="city-menu-search">
                  <span className="hs-icon"><Search size={16} /></span>
                  <input
                    autoFocus
                    placeholder="Search cities…"
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                  />
                </div>
                <div className="city-menu-list">
                  <div className="city-menu-label t-eyebrow">Popular cities</div>
                  {filteredCities.map((c) => (
                    <button
                      key={c.name}
                      role="option"
                      aria-selected={city === c.name}
                      className={`city-menu-item ${city === c.name ? 'is-selected' : ''}`}
                      onClick={() => handleCityPick(c.name)}
                      type="button"
                    >
                      <div>
                        <div className="cmi-name">{c.name}</div>
                        <div className="t-meta">{c.sub}</div>
                      </div>
                      {city === c.name && <span className="cmi-check"><Check size={14} /></span>}
                    </button>
                  ))}
                  {filteredCities.length === 0 && (
                    <div className="city-menu-empty t-meta">No cities match &ldquo;{cityQuery}&rdquo;</div>
                  )}
                </div>
                <div className="city-menu-foot">
                  <span className="city-menu-link">See all 118 cities →</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="header-nav" ref={navRef} aria-label="Main">
          <div className="nav-measure" aria-hidden>
            {NAV_LINKS.map((l) => (
              <span key={l.href} data-nav-measure className="nav-link">{l.label}</span>
            ))}
          </div>
          <div className="nav-visible">
            {visible.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${isActive(l.href) ? 'is-active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
            {overflow.length > 0 && (
              <div className="nav-more" ref={moreRef}>
                <button
                  type="button"
                  className={`nav-link ${overflow.some((o) => isActive(o.href)) ? 'is-active' : ''}`}
                  onClick={() => setMoreOpen((o) => !o)}
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                >
                  More
                  <ChevronDown
                    size={12}
                    style={{
                      marginLeft: 4,
                      transform: moreOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform var(--dur-1) var(--ease)',
                    }}
                  />
                </button>
                {moreOpen && (
                  <div className="nav-more-menu" role="menu">
                    {overflow.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        role="menuitem"
                        className={`nav-more-item ${isActive(l.href) ? 'is-active' : ''}`}
                        onClick={() => setMoreOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        <div className="header-right">
          <Link href="/search" className="icon-btn" aria-label="Search">
            <Search size={20} />
          </Link>
          {!authLoading && user && (
            <Link href="/dashboard/messages" className="icon-btn" aria-label="Messages">
              <Mail size={20} />
            </Link>
          )}
          <button className="icon-btn" aria-label="Notifications" type="button">
            <Bell size={20} />
          </button>
          <div className="header-divider" />

          {authLoading ? (
            <div style={{ width: 96 }} />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="btn btn-ghost" type="button">
                  {user.displayName || user.email.split('@')[0]}
                  <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" style={{ background: 'var(--paper)', border: 'var(--hairline)', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--r-md)' }}>
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.username || user.id}`)}>
                  <User className="h-4 w-4 mr-2" /> My profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/saved')}>
                  <Bookmark className="h-4 w-4 mr-2" /> Saved items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/account')}>
                  <Settings className="h-4 w-4 mr-2" /> Account settings
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem onClick={() => router.push('/admin')}>
                    <Shield className="h-4 w-4 mr-2" /> Admin panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Sign in</Link>
              <Link href="/signup" className="btn btn-primary">
                <Plus size={16} />
                <span>Post</span>
              </Link>
            </>
          )}

          <button
            className="icon-btn mobile-menu-btn"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <div className={`mobile-drawer ${menuOpen ? 'is-open' : ''}`}>
        <div className="mobile-drawer-head">
          <Logo className="h-8" />
          <button
            className="icon-btn"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mobile-drawer-city">
          <div className="t-eyebrow">Browsing in</div>
          <button
            type="button"
            className="loc-pill"
            onClick={() => { setMenuOpen(false); setCityOpen(true); }}
          >
            <MapPin />
            <span className="loc-pill-name">{city}</span>
            <ChevronDown size={12} />
          </button>
        </div>
        <nav className="mobile-drawer-nav">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              onClick={(e) => { e.preventDefault(); handleNav(l.href); }}
              href={l.href}
            >
              <span>{l.label}</span>
              <ArrowRight size={20} />
            </a>
          ))}
        </nav>
        <div className="mobile-drawer-foot">
          {authLoading ? (
            <div className="px-3 py-2.5 text-center w-full">
              <Loader2 className="h-4 w-4 animate-spin text-gray-300 inline" />
            </div>
          ) : user ? (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setMenuOpen(false); router.push('/dashboard'); }}
              >
                Dashboard
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { handleLogout(); setMenuOpen(false); }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setMenuOpen(false); router.push('/login'); }}
              >
                Sign in
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { setMenuOpen(false); router.push('/signup'); }}
              >
                <Plus size={16} />
                <span>Post</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
