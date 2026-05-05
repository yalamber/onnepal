'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MapPin, X } from 'lucide-react';

const COOKIE = 'onnepal-city';

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

/**
 * Compact banner that surfaces the active city scope on every list page.
 * Reads ?city= first, then the onnepal-city cookie, otherwise renders nothing.
 *
 * Self-contained — no props needed. Drop into any list page above the results.
 */
export function CityScopeBanner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cookieCity, setCookieCity] = useState<string>('');

  useEffect(() => {
    setCookieCity(readCookie(COOKIE));
  }, [pathname]);

  const urlCity = searchParams?.get('city')?.trim() || '';
  const city = urlCity || cookieCity;

  if (!city) return null;

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onnepal-city');
      document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    }
    setCookieCity('');
    const sp = new URLSearchParams(searchParams?.toString() ?? '');
    sp.delete('city');
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div
      className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-[var(--r-pill)] mb-6"
      style={{
        background: 'var(--accent-soft)',
        color: 'var(--teal-700)',
        border: '1px solid var(--teal-100)',
      }}
      role="status"
    >
      <div className="flex items-center gap-2 text-sm">
        <MapPin size={14} className="flex-shrink-0" />
        <span>
          Showing results in <strong>{city}</strong>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/cities"
          className="text-xs underline underline-offset-4 hover:opacity-70"
        >
          Switch city
        </Link>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 text-xs underline underline-offset-4 hover:opacity-70"
          aria-label="Clear city filter"
        >
          <X size={12} />
          See all of Nepal
        </button>
      </div>
    </div>
  );
}
