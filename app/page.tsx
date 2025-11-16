'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.isLoggedIn) {
          router.push('/dashboard');
        }
      });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="surface-panel max-w-3xl w-full text-center space-y-10 animate-fade-in">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-[rgba(124,143,255,0.18)] flex items-center justify-center">
            <Sparkles size={32} className="text-accent-strong" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">Space</h1>
            <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto">
              A calm, private hub for two people to swap moods, notes, gossip, and everything in between.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/register" className="btn-primary">
            <ArrowRight size={18} />
            <span>Get started</span>
          </Link>
          <Link href="/login" className="btn-tertiary">
            Already have an account?
          </Link>
        </div>

        <div className="soft-divider" />

        <p className="text-sm text-neutral-500">
          No algorithm. No noise. Just the two of you.
        </p>
      </div>
    </div>
  );
}
