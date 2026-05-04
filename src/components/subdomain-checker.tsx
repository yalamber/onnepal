'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';

export function SubdomainChecker({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [error, setError] = useState('');
  const router = useRouter();
  const dark = variant === 'dark';

  const checkAvailability = useCallback(async (value: string) => {
    if (value.length < 3) { setStatus('idle'); return; }
    setStatus('checking');
    try {
      const res = await fetch(`/api/subdomain/check?name=${encodeURIComponent(value)}`);
      const data = await res.json() as { available?: boolean; error?: string };
      if (!res.ok) { setStatus('invalid'); setError(data.error || 'Invalid name'); return; }
      setStatus(data.available ? 'available' : 'taken');
      setError(data.available ? '' : 'Already taken');
    } catch { setStatus('idle'); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (name.length >= 3) checkAvailability(name); }, 400);
    return () => clearTimeout(timer);
  }, [name, checkAvailability]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setName(value);
    if (value.length < 3) { setStatus('idle'); setError(''); }
  };

  const handleClaim = () => {
    if (status === 'available') router.push(`/create-business?subdomain=${encodeURIComponent(name)}`);
  };

  return (
    <div className="w-full max-w-md" role="search" aria-label="Check subdomain availability">
      <label htmlFor="subdomain-input" className="sr-only">Choose your subdomain</label>
      <div className={`flex items-center gap-0 rounded-lg p-1 transition-colors ${
        dark
          ? 'border border-gray-700 focus-within:border-gray-500 bg-gray-900'
          : 'border border-gray-200 focus-within:border-gray-400'
      }`}>
        <input
          id="subdomain-input"
          type="text"
          value={name}
          onChange={handleInputChange}
          onKeyDown={(e) => { if (e.key === 'Enter') handleClaim(); }}
          placeholder="yourname"
          maxLength={30}
          aria-describedby="subdomain-status"
          className={`flex-1 bg-transparent text-sm outline-none pl-3 py-2 ${
            dark
              ? 'text-white placeholder:text-gray-500'
              : 'text-gray-900 placeholder:text-gray-300'
          }`}
        />
        <span className={`text-sm pr-2 ${dark ? 'text-gray-500' : 'text-gray-300'}`}>.onnepal.com</span>
        <button
          onClick={handleClaim}
          disabled={status !== 'available'}
          className={`px-4 py-2 text-sm font-medium rounded-md disabled:opacity-20 disabled:cursor-default transition-colors cursor-pointer ${
            dark
              ? 'bg-white text-gray-950 hover:bg-gray-100'
              : 'bg-teal-700 text-white hover:bg-teal-800'
          }`}
        >
          {status === 'checking' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-label="Checking availability" />
          ) : (
            'Claim'
          )}
        </button>
      </div>
      <div id="subdomain-status" className="h-5 mt-1.5 px-1" aria-live="polite">
        {status === 'available' && (
          <p className="text-xs text-green-400 flex items-center gap-1">
            <Check className="h-3 w-3" aria-hidden="true" /> {name}.onnepal.com is available
          </p>
        )}
        {(status === 'taken' || status === 'invalid') && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <X className="h-3 w-3" aria-hidden="true" /> {error}
          </p>
        )}
        {status === 'idle' && name.length > 0 && name.length < 3 && (
          <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-300'}`}>At least 3 characters</p>
        )}
      </div>
    </div>
  );
}
