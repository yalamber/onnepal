'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, X } from 'lucide-react';

const COOKIE = 'onnepal-city';
const DISMISSED_KEY = 'onnepal-city-detect-dismissed';

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * First-visit IP-based city suggestion. Mounted only on the homepage.
 *
 * Behaviour:
 * 1. Skip if the user already has a city set (cookie or localStorage).
 * 2. Skip if the user has dismissed the prompt this session.
 * 3. Otherwise fetch /api/geo. If the detected city is in NEPAL_CITIES,
 *    show a non-blocking banner offering to switch. Confirming sets the
 *    cookie + navigates to /city/<slug>; "Browse all" sets a sentinel so
 *    we don't keep nagging; "Dismiss" same effect for this session only.
 *
 * Privacy: never sets the cookie without explicit user action.
 */
export function CityDetectPrompt() {
  const router = useRouter();
  const [city, setCity] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (readCookie(COOKIE) || localStorage.getItem('onnepal-city')) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    let cancelled = false;
    fetch('/api/geo')
      .then((r) => r.ok ? r.json() : null)
      .then((d: { detectedCity?: string | null } | null) => {
        if (!cancelled && d?.detectedCity) setCity(d.detectedCity);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!city || dismissed) return null;

  const confirm = () => {
    localStorage.setItem('onnepal-city', city);
    document.cookie = `${COOKIE}=${encodeURIComponent(city)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    router.push(`/city/${slugify(city)}`);
  };

  const skip = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      className="max-w-[var(--container)] mx-auto mt-4 mb-2 px-4"
    >
      <div
        className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 rounded-[var(--r-pill)]"
        style={{
          background: 'var(--accent-soft)',
          color: 'var(--teal-700)',
          border: '1px solid var(--teal-100)',
        }}
        role="region"
        aria-label="Detected city"
      >
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="flex-shrink-0" />
          <span>
            Looks like you&rsquo;re in <strong>{city}</strong>. Switch the site to {city}?
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={confirm}
            className="px-3 py-1.5 rounded-[var(--r-pill)] bg-[var(--ink-900)] text-[var(--paper)] text-xs font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Yes, switch to {city}
          </button>
          <button
            type="button"
            onClick={skip}
            className="px-3 py-1.5 text-xs underline underline-offset-4 hover:opacity-70"
          >
            Browse all of Nepal
          </button>
          <button
            type="button"
            onClick={skip}
            aria-label="Dismiss"
            className="p-1 hover:opacity-70"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
