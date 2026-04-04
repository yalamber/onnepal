'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, ArrowRight } from 'lucide-react';

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
      setError(data.available ? '' : 'This name is already taken');
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
    if (status === 'available') router.push(`/signup?subdomain=${encodeURIComponent(name)}`);
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-0 bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 transition-all duration-200 focus-within:border-blue-300 focus-within:shadow-md focus-within:shadow-blue-500/5">
        <div className="flex-1 flex items-center pl-3">
          <input
            type="text"
            value={name}
            onChange={handleInputChange}
            placeholder="yourbusiness"
            maxLength={30}
            className="w-full bg-transparent text-[0.9375rem] text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <span className="text-slate-300 text-sm pr-2 whitespace-nowrap">.onnepal.com</span>
        </div>
        <Button
          onClick={handleClaim}
          disabled={status !== 'available'}
          size="sm"
          className="h-9 px-5 rounded-xl"
        >
          {status === 'checking' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Claim <ArrowRight className="h-3.5 w-3.5" /></>
          )}
        </Button>
      </div>
      <div className="h-6 mt-2 px-3">
        {status === 'available' && (
          <p className="text-sm text-emerald-600 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> {name}.onnepal.com is available
          </p>
        )}
        {(status === 'taken' || status === 'invalid') && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <X className="h-3.5 w-3.5" /> {error}
          </p>
        )}
        {status === 'idle' && name.length > 0 && name.length < 3 && (
          <p className="text-sm text-slate-400">Type at least 3 characters</p>
        )}
      </div>
    </div>
  );
}
