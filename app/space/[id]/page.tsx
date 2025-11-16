'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { NoticeBoard } from '@/components/NoticeBoard';
import { SuttaButton } from '@/components/SuttaButton';
import { MoodSelector } from '@/components/MoodSelector';
import { GossipSection } from '@/components/GossipSection';
import { FrustrationButtons } from '@/components/FrustrationButtons';
import { NotificationPrompt } from '@/components/NotificationPrompt';

export default function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'notice' | 'gossip'>('notice');

  useEffect(() => {
    loadSpaceData();
  }, []);

  const loadSpaceData = async () => {
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
    } catch (error) {
      console.error('Failed to load space:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-retro">
          <p className="text-retro-dark">Loading space...</p>
        </div>
      </div>
    );
  }

  if (!space || !user) {
    return null;
  }

  const partner = space.userId1 === user.userId ? space.user2 : space.user1;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <NotificationPrompt />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold mb-1">
              {space.name}
            </h1>
            <p className="opacity-70 text-sm">
              You & {partner?.username}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-secondary"
          >
            Back
          </button>
        </div>

        {/* Separator */}
        <div className="border-t border-md-outline-variant"></div>

        {/* Tab Navigation with Action Buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setActiveTab('notice')}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              activeTab === 'notice'
                ? 'bg-md-primary-container text-md-on-primary-container'
                : 'bg-md-surface-container-high hover:bg-md-surface-container-highest'
            }`}
          >
            Notice
          </button>
          <button
            onClick={() => setActiveTab('gossip')}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              activeTab === 'gossip'
                ? 'bg-md-primary-container text-md-on-primary-container'
                : 'bg-md-surface-container-high hover:bg-md-surface-container-highest'
            }`}
          >
            Gossip
          </button>
          
          <div className="flex-1"></div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <SuttaButton spaceId={resolvedParams.id} partnerName={partner?.username} />
            <MoodSelector spaceId={resolvedParams.id} partnerName={partner?.username} />
            <FrustrationButtons spaceId={resolvedParams.id} partnerName={partner?.username} />
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-md-outline-variant"></div>

        {/* Content Area */}
        {activeTab === 'notice' && (
          <NoticeBoard spaceId={resolvedParams.id} userId={user.userId} />
        )}

        {activeTab === 'gossip' && (
          <GossipSection spaceId={resolvedParams.id} userId={user.userId} />
        )}
      </div>
    </div>
  );
}
