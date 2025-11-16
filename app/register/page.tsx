'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Lock, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
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
          <h1 className="text-3xl font-semibold">Join Space</h1>
          <p className="text-neutral-400 text-sm">Create your private corner and invite your person.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <UserPlus size={16} />
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-modern"
              placeholder="Choose a username"
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
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-neutral-300">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-modern"
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
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
                <span>Creating account</span>
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                <span>Create account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-neutral-500">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-accent-soft hover:text-accent-strong font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
