'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/logo';

interface Props { params: Promise<{ token: string }> }

export default function ResetPasswordPage({ params }: Props) {
  const { token } = use(params);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const j = await res.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) {
        throw new Error(j.error || 'Reset failed. The link may be invalid or expired.');
      }
      setSuccess(true);
      // Pause briefly so the success message is visible before bouncing to login.
      setTimeout(() => router.push('/login'), 2500);
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
          {success ? (
            <>
              <div className="flex items-center gap-2 text-[var(--evergreen-700)] mb-4">
                <CheckCircle2 className="h-6 w-6" />
                <h1 className="auth-title" style={{ margin: 0, fontSize: 28 }}>All <em>done.</em></h1>
              </div>
              <p className="text-[var(--ink-500)] text-sm">
                Your password has been updated. Redirecting you to login…
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-title">Choose a new <em>password.</em></h1>
              <p className="text-[var(--ink-500)] text-sm mt-2 mb-6">
                At least 8 characters. Pick something only you would know.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="t-meta block mb-2">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-300)]" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-[var(--ink-200)] text-sm placeholder:text-[var(--ink-300)] bg-[var(--paper)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm" className="t-meta block mb-2">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-300)]" />
                    <input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      autoComplete="new-password"
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
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[var(--ink-200)] text-sm text-[var(--ink-500)]">
                <Link href="/login" className="text-[var(--accent)] underline underline-offset-4">Back to login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
