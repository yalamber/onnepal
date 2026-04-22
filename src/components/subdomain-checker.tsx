'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';

export function SubdomainChecker() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [error, setError] = useState('');
  const router = useRouter();

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
    <div className="w-full max-w-md">
      <div className="flex items-center gap-0 border border-gray-200 rounded-lg p-1 focus-within:border-gray-400 transition-colors">
        <input
          type="text"
          value={name}
          onChange={handleInputChange}
          onKeyDown={(e) => { if (e.key === 'Enter') handleClaim(); }}
          placeholder="yourname"
          maxLength={30}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-300 outline-none pl-3 py-2"
        />
        <span className="text-gray-300 text-sm pr-2">.onnepal.com</span>
        <button
          onClick={handleClaim}
          disabled={status !== 'available'}
          className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-20 disabled:cursor-default transition-colors"
        >
          {status === 'checking' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Claim'
          )}
        </button>
      </div>
      <div className="h-5 mt-1.5 px-1">
        {status === 'available' && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" /> {name}.onnepal.com is available
          </p>
        )}
        {(status === 'taken' || status === 'invalid') && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <X className="h-3 w-3" /> {error}
          </p>
        )}
        {status === 'idle' && name.length > 0 && name.length < 3 && (
          <p className="text-xs text-gray-300">At least 3 characters</p>
        )}
      </div>
    </div>
  );
}
