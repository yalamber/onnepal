'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Search, Mail, Bell, Plus, Menu, X, MapPin, ChevronDown, Check,
  ArrowRight, LayoutDashboard, LogOut, Settings, Shield, User, Bookmark, Loader2, Globe,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NEPAL_CITIES } from '@/lib/nepal-cities';

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
  { href: '/voices', label: 'Voices' },
  { href: '/lost-found', label: 'Lost & Found' },
  { href: '/discussions', label: 'Discussions' },
];

// Top picks shown when the picker opens cold — "popular" is editorial, not data-driven.
// The full NEPAL_CITIES list (65+ entries) is searchable from the same input below.
const POPULAR_CITIES: Array<{ name: string; sub: string }> = [
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
  const searchParams = useSearchParams();
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

  // Populate the "popular cities" empty-state from real content counts.
  // Falls through to the editorial POPULAR_CITIES if the API is unavailable.
  const [popularLive, setPopularLive] = useState<Array<{ name: string; slug: string; count: number }>>([]);
  useEffect(() => {
    if (!cityOpen || popularLive.length > 0) return;
    let cancelled = false;
    fetch('/api/cities?limit=8')
      .then((r) => r.ok ? r.json() : null)
      .then((d: { cities?: Array<{ name: string; slug: string; count: number }> } | null) => {
        if (!cancelled && d?.cities) setPopularLive(d.cities);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [cityOpen, popularLive.length]);

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

  // Routes where we should stay-and-refilter rather than navigating to /city/<slug>.
  // Detail pages (e.g. /classifieds/<id>) and the city page itself are excluded —
  // the former because the user is reading something specific, the latter because
  // it has its own city in the URL.
  const LIST_PREFIXES = ['/directory', '/classifieds', '/jobs', '/events', '/places', '/pros', '/lost-found', '/discussions', '/voices', '/search'];
  const isListPage = (p: string) =>
    LIST_PREFIXES.some((pref) => p === pref || p === `${pref}/`);

  const slugify = (name: string) =>
    name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const setCityCookie = (value: string) => {
    if (typeof window === 'undefined') return;
    if (value) {
      localStorage.setItem('onnepal-city', value);
      document.cookie = `onnepal-city=${encodeURIComponent(value)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      localStorage.removeItem('onnepal-city');
      // Negative max-age expires the cookie immediately.
      document.cookie = `onnepal-city=; path=/; max-age=0; SameSite=Lax`;
    }
  };

  const handleCityPick = (name: string) => {
    setCity(name);
    setCityOpen(false);
    setCityQuery('');
    setCityCookie(name);
    const slug = slugify(name);

    // Context-aware navigation:
    //  - From a list page → keep the user where they are; just push ?city=<slug>
    //    into the URL and refresh server data.
    //  - From the homepage or a /city page → navigate to /city/<slug>.
    //  - From anywhere else (detail pages, dashboard, admin, auth) → don't yank
    //    them away. Cookie is set; refresh in place so any city-aware widgets
    //    (e.g. the live activity rail) re-render.
    if (isListPage(pathname)) {
      const sp = new URLSearchParams(searchParams?.toString() ?? '');
      sp.set('city', name);
      router.push(`${pathname}?${sp.toString()}`);
      return;
    }
    if (pathname === '/' || pathname.startsWith('/city/')) {
      router.push(`/city/${slug}`);
      return;
    }
    router.refresh();
  };

  const handleCityClear = () => {
    setCity('');
    setCityOpen(false);
    setCityQuery('');
    setCityCookie('');

    // Strip any explicit ?city= from the URL too, otherwise the page would
    // re-apply it on the next render.
    if (isListPage(pathname) || pathname === '/' || pathname.startsWith('/city/')) {
      const sp = new URLSearchParams(searchParams?.toString() ?? '');
      sp.delete('city');
      const qs = sp.toString();
      // /city/<slug> doesn't make sense without a city — bounce to homepage.
      const target = pathname.startsWith('/city/') ? '/' : pathname;
      router.push(qs ? `${target}?${qs}` : target);
      return;
    }
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  const visible = NAV_LINKS.slice(0, visibleCount);
  const overflow = NAV_LINKS.slice(visibleCount);

  // Empty query → editorial popular list (with the "Capital · 1.4M" sub copy).
  // Non-empty query → search the full NEPAL_CITIES (65+ cities), capped at 12 hits.
  const trimmedQuery = cityQuery.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;
  // Empty state: prefer real content counts (popularLive) over editorial copy.
  // Fall back to editorial POPULAR_CITIES if /api/cities hasn't responded yet
  // or returned nothing (e.g. brand-new install with no listings).
  const filteredCities: Array<{ name: string; sub: string }> = isSearching
    ? NEPAL_CITIES
        .filter((c) => c.name.toLowerCase().includes(trimmedQuery))
        .slice(0, 12)
        .map((c) => ({ name: c.name, sub: '' }))
    : popularLive.length > 0
      ? popularLive.map((c) => ({
          name: c.name,
          sub: c.count > 0 ? `${c.count.toLocaleString('en-US')} live` : '',
        }))
      : POPULAR_CITIES;
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
              aria-label={city ? `Currently browsing ${city}. Switch city.` : 'Browsing all of Nepal. Pick a city.'}
              type="button"
            >
              {city ? <MapPin /> : <Globe />}
              <span className="loc-pill-name">{city || 'All of Nepal'}</span>
              {city && <>
                <span className="loc-sep">·</span>
                <span className="loc-sub">Nepal</span>
              </>}
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
                  {/* "All of Nepal" — always at the top, only shown when not searching
                      and a city is currently set. Gives the user an explicit escape
                      from the city filter without having to clear cookies. */}
                  {!isSearching && city && (
                    <>
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        className="city-menu-item"
                        onClick={handleCityClear}
                      >
                        <div className="cmi-text-row">
                          <Globe size={16} className="cmi-leading" />
                          <div>
                            <div className="cmi-name">All of Nepal</div>
                            <div className="t-meta">Browse without a city filter</div>
                          </div>
                        </div>
                      </button>
                      <div className="city-menu-divider" />
                    </>
                  )}
                  <div className="city-menu-label t-eyebrow">
                    {isSearching ? `${filteredCities.length} match${filteredCities.length === 1 ? '' : 'es'}` : 'Popular cities'}
                  </div>
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
                        {c.sub && <div className="t-meta">{c.sub}</div>}
                      </div>
                      {city === c.name && <span className="cmi-check"><Check size={14} /></span>}
                    </button>
                  ))}
                  {filteredCities.length === 0 && (
                    <div className="city-menu-empty t-meta">No cities match &ldquo;{cityQuery}&rdquo;</div>
                  )}
                </div>
                <div className="city-menu-foot">
                  <Link
                    href="/cities"
                    className="city-menu-link"
                    onClick={() => setCityOpen(false)}
                  >
                    Browse all {NEPAL_CITIES.length} cities →
                  </Link>
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
