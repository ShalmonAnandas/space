"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-retro">
          <p className="text-retro-dark">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-retro max-w-md w-full text-center">
          <h1 className="text-3xl font-semibold mb-4">Oops!</h1>
          <p className="opacity-80 mb-6">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-retro max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-4xl font-semibold mb-2">You are Invited!</h1>
          <p className="opacity-80">
            Join <span className="font-semibold">{spaceInfo?.name}</span>
          </p>
        </div>

        <div className="bg-md-primary-container text-md-on-primary-container p-4 rounded border border-md-outline-variant">
          <p>
            <span className="font-semibold">{spaceInfo?.creatorUsername}</span> wants to share a space with you!
          </p>
        </div>

        {!isLoggedIn && (
          <div className="bg-md-secondary-container text-md-on-secondary-container p-4 rounded border border-md-outline-variant">
            <p className="text-sm">
              You will need to log in or create an account first
            </p>
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="btn-primary w-full disabled:opacity-50"
        >
          {joining ? 'Joining...' : isLoggedIn ? 'Join Space' : 'Login to Join'}
        </button>
      </div>
    </div>
  );
}
