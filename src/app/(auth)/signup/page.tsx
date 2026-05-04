'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error || 'Signup failed');
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
          <h1 className="auth-title">Make it <em>yours.</em></h1>
          <p className="text-[var(--ink-500)] text-sm mt-2 mb-6">Join Nepal&apos;s local community platform</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="text-xs font-medium text-gray-500 mb-1.5 block">Your name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  id="displayName"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="Full name"
                  required
                  minLength={2}
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-700 font-medium hover:text-teal-700 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
