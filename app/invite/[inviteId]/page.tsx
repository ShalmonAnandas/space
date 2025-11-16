"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Users2, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function InvitePage({ params }: { params: Promise<{ inviteId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [spaceInfo, setSpaceInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuthAndInvite = useCallback(async () => {
    try {
      // Check auth
      const authResponse = await fetch('/api/auth/me');
      const authData = await authResponse.json();
      setIsLoggedIn(authData.isLoggedIn);

      // Check invite validity
      const inviteResponse = await fetch(`/api/invites/${resolvedParams.inviteId}`);
      const inviteData = await inviteResponse.json();

      if (inviteResponse.ok) {
        setSpaceInfo(inviteData.space);
      } else {
        setError(inviteData.error || 'Invalid invite link');
      }
    } catch (err) {
      setError('Failed to load invite');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.inviteId]);

  useEffect(() => {
    checkAuthAndInvite();
  }, [checkAuthAndInvite]);

  const handleJoin = async () => {
    if (!isLoggedIn) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/invite/${resolvedParams.inviteId}`);
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`/api/invites/${resolvedParams.inviteId}/join`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/space/${data.space.id}`);
      } else {
        setError(data.error || 'Failed to join space');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="surface-panel flex items-center gap-3">
          <Spinner size={20} />
          <p className="text-neutral-300">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="surface-panel max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">Something went sideways</h1>
            <p className="text-neutral-400">{error}</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            <ArrowRight size={16} />
            <span>Back to dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="surface-panel max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-[rgba(124,143,255,0.18)] flex items-center justify-center">
              <Users2 size={30} className="text-accent-strong" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold">You&apos;re invited</h1>
          <p className="text-neutral-300">
            Join <span className="text-neutral-100 font-semibold">{spaceInfo?.name}</span> and keep in sync with {spaceInfo?.creatorUsername}.
          </p>
        </div>

        <div className="surface-soft surface-glow p-4 border border-surface-border text-sm text-neutral-200">
          <span className="font-semibold text-accent-soft">{spaceInfo?.creatorUsername}</span> wants to share this space with you.
        </div>

        {!isLoggedIn && (
          <div className="surface-soft p-4 border border-[rgba(124,143,255,0.18)] text-xs text-neutral-400">
            You&apos;ll need to log in or create an account before joining.
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="btn-primary w-full disabled:cursor-not-allowed"
        >
          {joining ? (
            <>
              <Spinner size={18} />
              <span>Joining</span>
            </>
          ) : isLoggedIn ? (
            <>
              <Sparkles size={18} />
              <span>Join space</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>Login to join</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
