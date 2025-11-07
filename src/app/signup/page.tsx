'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, AlertCircle, UserCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, displayName }),
      });

      const data = (await res.json()) as { error?: string };

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <span className="text-white font-bold">ON</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            OnNepal
          </span>
        </Link>

        <Card className="shadow-xl border-2">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">
              Join OnNepal and start sharing your stories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="johndoe"
                    pattern="[a-zA-Z0-9_]+"
                    title="Only letters, numbers, and underscores"
                    className="pl-11"
                  />
                </div>
                <p className="text-xs text-slate-500">Only letters, numbers, and underscores allowed</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700">
                  Display Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="pl-11"
                  />
                </div>
                <p className="text-xs text-slate-500">Minimum 8 characters required</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full text-base font-semibold"
                disabled={loading}
                size="lg"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-slate-700">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-slate-700">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
