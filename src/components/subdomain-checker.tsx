'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Loader2, ArrowRight } from 'lucide-react';

export function SubdomainChecker() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [error, setError] = useState('');
  const router = useRouter();

  const checkAvailability = useCallback(async (value: string) => {
    if (value.length < 3) {
      setStatus('idle');
      return;
    }

    setStatus('checking');
    try {
      const res = await fetch(`/api/subdomain/check?name=${encodeURIComponent(value)}`);
      const data = await res.json() as { available?: boolean; error?: string };

      if (!res.ok) {
        setStatus('invalid');
        setError(data.error || 'Invalid name');
        return;
      }

      setStatus(data.available ? 'available' : 'taken');
      setError(data.available ? '' : 'This name is already taken');
    } catch {
      setStatus('idle');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (name.length >= 3) {
        checkAvailability(name);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [name, checkAvailability]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setName(value);
    if (value.length < 3) {
      setStatus('idle');
      setError('');
    }
  };

  const handleClaim = () => {
    if (status === 'available') {
      router.push(`/signup?subdomain=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-stretch gap-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex-1 flex items-center">
          <Input
            type="text"
            value={name}
            onChange={handleInputChange}
            placeholder="yourbusiness"
            className="border-0 shadow-none text-lg h-14 focus-visible:ring-0 rounded-none"
            maxLength={30}
          />
          <span className="text-gray-400 text-sm pr-3 whitespace-nowrap">.onnepal.com</span>
        </div>
        <Button
          onClick={handleClaim}
          disabled={status !== 'available'}
          className="h-14 px-6 rounded-none bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {status === 'checking' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Claim <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
      <div className="h-8 mt-2 px-1">
        {status === 'available' && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <Check className="h-4 w-4" />
            {name}.onnepal.com is available!
          </p>
        )}
        {(status === 'taken' || status === 'invalid') && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <X className="h-4 w-4" />
            {error}
          </p>
        )}
        {status === 'idle' && name.length > 0 && name.length < 3 && (
          <p className="text-sm text-gray-400">Type at least 3 characters</p>
        )}
      </div>
    </div>
  );
}
