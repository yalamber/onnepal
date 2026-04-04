'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as { error?: string; success?: boolean; user?: { onboardingStep: number } };
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      window.dispatchEvent(new Event('auth-change'));

      if (data.user && data.user.onboardingStep < 4) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
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
          <h1 className="text-[1.5rem] font-bold text-neutral-950 tracking-[-0.025em] leading-[1.2]">Welcome back</h1>
          <p className="text-neutral-500 text-[0.875rem] mt-2 leading-[1.6]">Log in to manage your page</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-neutral-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-neutral-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="mt-1.5"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log in'}
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-400 mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-neutral-950 font-medium hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
