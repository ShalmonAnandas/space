'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { NoticeBoard } from '@/components/NoticeBoard';
import { SuttaButton } from '@/components/SuttaButton';
import { MoodSelector } from '@/components/MoodSelector';
import { GossipSection } from '@/components/GossipSection';
import { FrustrationButtons } from '@/components/FrustrationButtons';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { NotificationButton } from '@/components/NotificationButton';
import { ArrowLeft, NotebookPen, MessageSquare } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'notice' | 'gossip'>('notice');
  const [partnerMood, setPartnerMood] = useState<string | null>(null);

  const loadSpaceData = useCallback(async () => {
    try {
      // Check auth
      const authResponse = await fetch('/api/auth/me');
      const authData = await authResponse.json();

      if (!authData.isLoggedIn) {
        router.push('/login');
        return;
      }

      setUser(authData);

      // Load space
      const spacesResponse = await fetch('/api/spaces');
      const spacesData = await spacesResponse.json();
      const foundSpace = spacesData.spaces?.find((s: any) => s.id === resolvedParams.id);

      if (!foundSpace) {
        router.push('/dashboard');
        return;
      }

      setSpace(foundSpace);

      // Load partner's mood
      const moodResponse = await fetch(`/api/spaces/${resolvedParams.id}/mood`);
      const moodData = await moodResponse.json();
      if (moodData.partnerMood) {
        setPartnerMood(moodData.partnerMood.mood);
      }
    } catch (error) {
      console.error('Failed to load space:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    loadSpaceData();
  }, [loadSpaceData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="surface-panel flex items-center gap-3">
          <Spinner size={20} />
          <p className="text-neutral-300">Loading space...</p>
        </div>
      </div>
    );
  }

  if (!space || !user) {
    return null;
  }

  const partner = space.userId1 === user.userId ? space.user2 : space.user1;

  return (
    <div className="min-h-screen">
      <NotificationPrompt />

      <div className="page-shell">
        <header className="surface-panel animate-fade-in flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-ghost"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={18} />
              </button>
              <NotificationButton />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{space.name}</h1>
              <p className="text-sm text-neutral-400">
                You &nbsp;• {partner?.username || 'Waiting to connect'}
                {partnerMood && (
                  <span className="ml-2 badge-neutral">
                    Mood: {partnerMood}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {space.suttaEnabled && (
              <SuttaButton spaceId={resolvedParams.id} partnerName={partner?.username} />
            )}
            <MoodSelector spaceId={resolvedParams.id} partnerName={partner?.username} />
            <FrustrationButtons spaceId={resolvedParams.id} partnerName={partner?.username} />
          </div>
        </header>

        <section className="surface-panel animate-fade-in flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('notice')}
            className={`btn-tertiary ${
              activeTab === 'notice' ? 'bg-[rgba(124,143,255,0.22)] text-accent-strong' : ''
            }`}
          >
            <NotebookPen size={16} />
            <span>What are the vibes today?</span>
          </button>
          <button
            onClick={() => setActiveTab('gossip')}
            className={`btn-tertiary ${
              activeTab === 'gossip' ? 'bg-[rgba(124,143,255,0.22)] text-accent-strong' : ''
            }`}
          >
            <MessageSquare size={16} />
            <span>Gossip</span>
          </button>
        </section>

        {activeTab === 'notice' ? (
          <NoticeBoard spaceId={resolvedParams.id} userId={user.userId} />
        ) : (
          <GossipSection spaceId={resolvedParams.id} userId={user.userId} />
        )}
      </div>
    </div>
  );
}
