'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.hint || data.error);
        setLoading(false);
        return;
      }

      if (data.data.user.isApproved) {
        router.push('/home');
      } else {
        router.push('/apply?step=pending');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-gold">Founders Club</h1>
            <p className="text-text-tertiary text-sm mt-1">MIT × Harvard</p>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Sign in</h2>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-sm text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@mit.edu"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-gold/50 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-background font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-text-tertiary text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/apply" className="text-gold hover:text-gold-light transition-colors">
              Apply now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
