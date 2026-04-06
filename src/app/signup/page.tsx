'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Loader2, ArrowRight } from 'lucide-react';

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
  const prefilledName = searchParams.get('name') || '';
  const hasPrefilledData = prefilledSubdomain.length >= 3 && prefilledName.length >= 2;

  const [form, setForm] = useState({
    email: '',
    password: '',
    businessName: prefilledName,
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
          {hasPrefilledData ? (
            <>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight leading-[1.2]">Almost there!</h1>
              <p className="text-slate-500 text-sm mt-2 leading-[1.6]">
                Just add your email and password to claim
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-sm font-mono font-medium text-slate-700">{form.subdomain}.onnepal.com</span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight leading-[1.2]">Create your page</h1>
              <p className="text-slate-500 text-sm mt-2 leading-[1.6]">Get started in under a minute</p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Only show subdomain/name fields if not prefilled from builder */}
          {!hasPrefilledData && (
            <>
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
            </>
          )}

          <div>
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              autoFocus={hasPrefilledData}
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
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasPrefilledData ? (
              <>Create {form.subdomain}.onnepal.com <ArrowRight className="h-4 w-4 ml-1" /></>
            ) : (
              'Create my page'
            )}
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
