'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock } from 'lucide-react';
import { Logo } from '@/components/logo';

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

      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      window.dispatchEvent(new Event('auth-change'));
      router.push('/dashboard');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex justify-center mb-8">
          <Link href="/"><Logo className="h-10" /></Link>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Welcome <em>back.</em></h1>
          <p className="text-[var(--ink-500)] text-sm mt-2 mb-6">Log in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-medium text-gray-500">Password</label>
                <Link href="/forgot-password" className="text-xs text-[var(--accent)] hover:underline underline-offset-2">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-teal-700 font-medium hover:text-teal-700 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
