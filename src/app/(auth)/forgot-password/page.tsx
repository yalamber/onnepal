'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        // The API returns 200 even when the email is unknown to avoid enumeration,
        // so anything else here is a true error worth surfacing.
        const j = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
          {submitted ? (
            <>
              <h1 className="auth-title">Check your <em>inbox.</em></h1>
              <p className="text-[var(--ink-500)] text-sm mt-2 mb-6">
                If an OnNepal account exists for <strong className="text-[var(--ink-900)]">{email}</strong>,
                we&rsquo;ve sent a password-reset link. It expires in 60 minutes.
              </p>
              <p className="text-sm text-[var(--ink-500)]">
                Didn&rsquo;t get it? Check spam, or{' '}
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); }}
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  try again
                </button>.
              </p>
              <div className="mt-6 pt-6 border-t border-[var(--ink-200)]">
                <Link href="/login" className="text-sm text-[var(--accent)] underline underline-offset-4">← Back to login</Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="auth-title">Forgot your <em>password?</em></h1>
              <p className="text-[var(--ink-500)] text-sm mt-2 mb-6">
                Enter the email on your account and we&rsquo;ll send a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="t-meta block mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-300)]" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-[var(--ink-200)] text-sm placeholder:text-[var(--ink-300)] bg-[var(--paper)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-[var(--crimson-100)]/40 border border-[var(--crimson-100)] px-3 py-2.5">
                    <p className="text-sm text-[var(--crimson-700)]">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[var(--ink-900)] text-[var(--paper)] text-sm font-medium rounded-lg hover:bg-[var(--accent)] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[var(--ink-200)] text-sm text-[var(--ink-500)]">
                Remembered it?{' '}
                <Link href="/login" className="text-[var(--accent)] underline underline-offset-4">Back to login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
