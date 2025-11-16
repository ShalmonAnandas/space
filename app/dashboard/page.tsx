'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { InstallPrompt } from '@/components/InstallPrompt';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import OnboardingModal from '@/components/OnboardingModal';
import { Toast } from '@/components/Toast';
import {
  LogOut,
  PlusCircle,
  UserPlus2,
  Share2,
  Users2,
  ExternalLink,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copying, setCopying] = useState(false);
  const [inviteLoading, setInviteLoading] = useState<string | null>(null);

  const loadSpaces = useCallback(async () => {
    try {
      const response = await fetch('/api/spaces');
      const data = await response.json();
      setSpaces(data.spaces || []);
    } catch (error) {
      console.error('Failed to load spaces:', error);
      setToastMessage('Unable to load spaces right now.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  }, [setSpaces]);

  const checkAuth = useCallback(async () => {
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
  }, [router, setUser, loadSpaces]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show onboarding only the first time user lands on dashboard (per device)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem('onboardingSeen') === 'true';
    if (!seen) {
      setShowOnboarding(true);
      localStorage.setItem('onboardingSeen', 'true');
    }
  }, []);

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
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
        showToastMessage('Fresh space ready to share.');
      }
    } catch (error) {
      console.error('Failed to create space:', error);
      showToastMessage('Could not create a space. Try again later.');
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateInvite = async (spaceId: string) => {
    try {
      setInviteLoading(spaceId);
      const response = await fetch(`/api/spaces/${spaceId}/invite`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        setInviteLink(data.inviteUrl);
        setShowInviteModal(true);
      } else {
        showToastMessage(data.error || 'Could not generate invite.');
      }
    } catch (error) {
      console.error('Failed to generate invite:', error);
      showToastMessage('Could not generate invite.');
    } finally {
      setInviteLoading(null);
    }
  };

  const copyInviteLink = () => {
    if (!inviteLink) return;
    setCopying(true);
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        showToastMessage('Invite link copied.');
      })
      .catch(() => {
        showToastMessage('Unable to copy link.');
      })
      .finally(() => setCopying(false));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const emptyState = useMemo(() => spaces.length === 0, [spaces.length]);

  return (
    <div className="min-h-screen">
      <InstallPrompt />
      <NotificationPrompt />
      {showOnboarding && (
        <OnboardingModal
          onClose={() => setShowOnboarding(false)}
          onComplete={() => {/* reserved for future analytics */}}
          onShowToast={showToastMessage}
        />
      )}
      
      <div className="page-shell">
        <header className="surface-panel animate-fade-in">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="badge-neutral">Dashboard</span>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Welcome back, {user?.username}
              </h1>
              <p className="text-sm text-neutral-400 max-w-xl">
                Share moments, leave notes, and keep your space in sync with a calm, focused hub built for two.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateSpace}
                disabled={creating}
                className="btn-primary"
              >
                {creating ? (
                  <>
                    <Spinner size={18} />
                    <span>Creating</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    <span>New Space</span>
                  </>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="btn-ghost"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <section className="surface-panel animate-fade-in">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users2 size={18} className="text-accent-soft" />
                  Spaces overview
                </h2>
                <p className="text-sm text-neutral-400">
                  {emptyState ? 'You have not created a space yet.' : 'Tap a space to jump inside or share an invite.'}
                </p>
              </div>
              <div className="flex gap-2 text-xs text-neutral-400">
                <span className="badge-neutral">Total {spaces.length}</span>
              </div>
            </div>

            <div className="soft-divider" />

            {loading ? (
              <div className="grid gap-3 md:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} height={140} className="bg-surface-soft" />
                ))}
              </div>
            ) : emptyState ? (
              <div className="surface-soft surface-glow p-8 text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-full bg-[rgba(124,143,255,0.14)] flex items-center justify-center">
                  <UserPlus2 size={26} className="text-accent-strong" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Create your first space</h3>
                  <p className="text-sm text-neutral-400">
                    Invite someone special and keep your shared updates, moods, and notices in one living place.
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleCreateSpace}
                    disabled={creating}
                    className="btn-secondary"
                  >
                    {creating ? (
                      <>
                        <Spinner size={18} />
                        <span>Creating</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle size={18} />
                        <span>Create a space</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {spaces.map((space: any) => {
                  const joined = Boolean(space.user2);
                  const isOwner = space.userId1 === user?.userId;

                  return (
                    <div key={space.id} className="tile animate-fade-in">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <button
                            onClick={() => joined && router.push(`/space/${space.id}`)}
                            className={`text-left flex flex-col gap-2 ${joined ? '' : 'cursor-default'}`}
                          >
                            <span className="text-sm uppercase tracking-[0.15em] text-neutral-500">Space</span>
                            <h3 className="text-2xl font-semibold leading-tight">
                              {space.name}
                            </h3>
                          </button>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="badge-modern">{space.user1.username}</span>
                            <span className={`badge-neutral ${joined ? '' : 'opacity-70'}`}>
                              {joined ? space.user2.username : 'Waiting to join'}
                            </span>
                          </div>
                        </div>
                        {joined ? (
                          <button
                            onClick={() => router.push(`/space/${space.id}`)}
                            className="btn-ghost"
                            aria-label="Enter space"
                          >
                            <ExternalLink size={18} />
                          </button>
                        ) : isOwner ? (
                          <button
                            onClick={() => handleGenerateInvite(space.id)}
                            className="btn-ghost"
                            aria-label="Generate invite"
                            disabled={inviteLoading === space.id}
                          >
                            {inviteLoading === space.id ? <Spinner size={16} /> : <Share2 size={18} />}
                          </button>
                        ) : null}
                      </div>
                      {!joined && (
                        <p className="text-sm text-neutral-400 mt-4">
                          Invite pending. Generate a fresh link and nudge them to accept.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-[rgba(5,7,12,0.72)]">
          <div className="surface-panel max-w-lg w-full animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[rgba(124,143,255,0.18)] flex items-center justify-center">
                  <Share2 size={20} className="text-accent-strong" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Invite link ready</h2>
                  <p className="text-sm text-neutral-400">Share this with your partner to bring them aboard.</p>
                </div>
              </div>

              <div className="surface-soft surface-glow p-4 text-sm break-all border border-surface-border">
                <code>{inviteLink}</code>
              </div>

              <div className="flex gap-2 flex-col sm:flex-row">
                <button onClick={copyInviteLink} className="btn-primary flex-1" disabled={copying}>
                  {copying ? (
                    <>
                      <Spinner size={18} />
                      <span>Copying</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={18} />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="btn-tertiary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </div>
  );
}
