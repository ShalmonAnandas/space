'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { InstallPrompt } from '@/components/InstallPrompt';
import { NotificationBadge } from '@/components/NotificationBadge';

interface Space {
  id: string;
  name: string;
  userId1: string;
  userId2: string | null;
  user1: { id: string; username: string };
  user2: { id: string; username: string } | null;
}

interface ApiSpace extends Space {
  createdAt?: string;
  updatedAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser, setSpaces, spaces } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.isLoggedIn) {
        router.push('/login');
        return;
      }

      setUser(data);
      loadSpaces();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const loadSpaces = async () => {
    try {
      const response = await fetch('/api/spaces');
      const data = await response.json();
      setSpaces(data.spaces || []);
    } catch (error) {
      console.error('Failed to load spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    setCreating(true);

    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        loadSpaces();
      }
    } catch (error) {
      console.error('Failed to create space:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateInvite = async (spaceId: string) => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/invite`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        setInviteLink(data.inviteUrl);
        setShowInviteModal(true);
      }
    } catch (error) {
      console.error('Failed to generate invite:', error);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-retro">
          <p className="text-retro-dark">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <NotificationBadge />
      <InstallPrompt />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card-retro flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-retro-dark">
              👋 Hey, {user?.username}!
            </h1>
            <p className="text-retro-medium">Your shared spaces</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>

        {/* Create Space Button */}
        <button
          onClick={handleCreateSpace}
          disabled={creating}
          className="btn-primary w-full"
        >
          {creating ? 'Creating...' : '✨ Create New Space'}
        </button>

        {/* Spaces List */}
        <div className="space-y-4">
          {spaces.length === 0 ? (
            <div className="card-retro text-center">
              <p className="text-retro-medium">
                No spaces yet. Create one to get started!
              </p>
            </div>
          ) : (
            spaces.map((space: any) => (
              <div key={space.id} className="card-retro hover:shadow-retro transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-retro-dark mb-2">
                      {space.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="badge-retro bg-pastel-purple">
                        {space.user1.username}
                      </span>
                      {space.user2 ? (
                        <span className="badge-retro bg-pastel-green">
                          {space.user2.username}
                        </span>
                      ) : (
                        <span className="badge-retro bg-pastel-yellow">
                          Waiting for partner...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {space.user2 ? (
                    <button
                      onClick={() => router.push(`/space/${space.id}`)}
                      className="btn-primary flex-1"
                    >
                      Open Space →
                    </button>
                  ) : space.userId1 === user?.userId ? (
                    <button
                      onClick={() => handleGenerateInvite(space.id)}
                      className="btn-secondary flex-1"
                    >
                      📨 Generate Invite Link
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card-retro max-w-lg w-full">
            <h2 className="text-2xl font-bold text-retro-dark mb-4">
              🎉 Invite Link Generated!
            </h2>
            <p className="text-retro-medium mb-4">
              Share this link with your partner to join this space:
            </p>
            <div className="bg-pastel-purple-light p-4 rounded-retro mb-4 break-all">
              <code className="text-sm">{inviteLink}</code>
            </div>
            <div className="flex gap-2">
              <button onClick={copyInviteLink} className="btn-primary flex-1">
                📋 Copy Link
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
