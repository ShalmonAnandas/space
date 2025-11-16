'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="surface-panel max-w-md w-full space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-neutral-400 text-sm">Sign in to rejoin your shared space.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <User size={16} />
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-modern"
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Lock size={16} />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-modern"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-sm text-danger bg-[rgba(241,126,126,0.12)] border border-[rgba(241,126,126,0.28)] rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Spinner size={18} />
                <span>Signing in</span>
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-neutral-500">
          <p>
            No account yet?{' '}
            <Link href="/register" className="text-accent-soft hover:text-accent-strong font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
