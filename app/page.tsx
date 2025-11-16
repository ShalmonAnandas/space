'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-retro max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold mb-4">
            Partner App
          </h1>
          <p className="text-xl opacity-80 mb-8">
            Your private shared space for two
          </p>
        </div>

        <div className="space-y-4">
          <p>
            Share moods, vent frustrations, and stay connected with your partner through unique, asynchronous communication channels.
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/login" className="btn-primary">
            Login
          </Link>
          <Link href="/register" className="btn-secondary">
            Get Started
          </Link>
        </div>

        <div className="pt-8 border-t border-md-outline-variant">
          <p className="text-sm opacity-70">
            Notice Board • Sutta Button • Mood Sharing • Gossip • Frustration Vents
          </p>
        </div>
      </div>
    </div>
  );
}
