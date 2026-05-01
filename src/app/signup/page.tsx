'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, Search, ShoppingBag, Briefcase, Store } from 'lucide-react';
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

  const perks = [
    { icon: Store, text: 'Get yourname.onnepal.com' },
    { icon: ShoppingBag, text: 'Post classifieds for free' },
    { icon: Briefcase, text: 'List jobs and events' },
    { icon: Search, text: 'Join the community' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-950 flex-col justify-between p-12">
        <Logo className="h-10 brightness-0 invert" />
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight">
            Join Nepal&apos;s local<br />
            <span className="text-cyan-400">community platform.</span>
          </h2>
          <ul className="mt-6 space-y-3">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="text-sm text-gray-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-gray-600">Free forever. No credit card required.</p>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo className="h-10" />
          </div>

          <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1.5 mb-8">It only takes a minute</p>

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
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
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
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
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
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
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
              className="w-full h-11 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-600 font-medium hover:text-cyan-700 transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
