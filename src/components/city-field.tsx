'use client';

import { useEffect, useRef } from 'react';
import { CitySelector } from '@/components/city-selector';

const COOKIE = 'onnepal-city';

function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Show "(required)" label decoration and the empty-state error styling. */
  required?: boolean;
  /** Optional helper text under the label. */
  hint?: string;
  label?: string;
  /** When true (default), pre-fill from the user's onnepal-city cookie on first
   * mount if the form value is currently empty. The user can still change or
   * clear it. */
  autofillFromCookie?: boolean;
}

/**
 * Standard "what city is this listing in?" field.
 *
 * Strict: only values from NEPAL_CITIES (the underlying CitySelector enforces this
 * by exposing a fixed list — we don't accept free-text). Defaults to the user's
 * preferred city via cookie so most submissions are zero-click.
 */
export function CityField({
  value,
  onChange,
  required = false,
  hint,
  label = 'City',
  autofillFromCookie = true,
}: Props) {
  const didAutofill = useRef(false);

  useEffect(() => {
    if (!autofillFromCookie || didAutofill.current) return;
    didAutofill.current = true;
    if (value) return; // user already has a value
    const cookieCity = readCookie(COOKIE);
    if (cookieCity) onChange(cookieCity);
    // intentional one-shot: we do not re-autofill if user clears the value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1.5 block">
        {label}
        {required && <span className="text-[var(--crimson-700)] ml-0.5" aria-hidden>*</span>}
      </label>
      <CitySelector
        value={value}
        onChange={onChange}
        className="h-10 w-full px-3 rounded-md border border-[var(--ink-200)] text-sm focus:outline-none focus:border-[var(--ink-900)] transition-colors bg-[var(--paper)] flex items-center justify-between gap-2 cursor-pointer"
      />
      {hint && <p className="mt-1 text-[11px] text-[var(--ink-500)]">{hint}</p>}
    </div>
  );
}
