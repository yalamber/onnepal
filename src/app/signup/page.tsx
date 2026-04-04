'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Loader2 } from 'lucide-react';

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledSubdomain = searchParams.get('subdomain') || '';

  const [form, setForm] = useState({
    email: '',
    password: '',
    businessName: '',
    subdomain: prefilledSubdomain,
  });
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>(
    prefilledSubdomain ? 'available' : 'idle'
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!form.subdomain || form.subdomain.length < 3) {
      setSubdomainStatus('idle');
      return;
    }
    const timer = setTimeout(async () => {
      setSubdomainStatus('checking');
      try {
        const res = await fetch(`/api/subdomain/check?name=${encodeURIComponent(form.subdomain)}`);
        const data = await res.json() as { available?: boolean };
        setSubdomainStatus(res.ok && data.available ? 'available' : res.ok ? 'taken' : 'invalid');
      } catch {
        setSubdomainStatus('idle');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.subdomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subdomainStatus !== 'available') return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json() as { error?: string; success?: boolean };
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      window.dispatchEvent(new Event('auth-change'));
      router.push('/onboarding');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-[1.5rem] font-bold text-slate-950 tracking-[-0.025em] leading-[1.2]">Create your page</h1>
          <p className="text-slate-500 text-[0.875rem] mt-2 leading-[1.6]">Get started in under a minute</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subdomain" className="text-slate-700">Your page URL</Label>
            <div className="flex items-center mt-1.5">
              <Input
                id="subdomain"
                value={form.subdomain}
                onChange={(e) =>
                  setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                }
                placeholder="yourbusiness"
                maxLength={30}
                className="rounded-r-none"
              />
              <span className="px-3 py-2 bg-slate-50 border border-l-0 border-slate-200 rounded-r-lg text-sm text-slate-400 h-10 flex items-center">
                .onnepal.com
              </span>
            </div>
            <div className="h-5 mt-1.5">
              {subdomainStatus === 'checking' && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                </span>
              )}
              {subdomainStatus === 'available' && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Available
                </span>
              )}
              {subdomainStatus === 'taken' && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" /> Already taken
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="businessName" className="text-slate-700">Business name</Label>
            <Input
              id="businessName"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="My Business"
              required
              minLength={2}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="mt-1.5"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || subdomainStatus !== 'available'}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create my page'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
