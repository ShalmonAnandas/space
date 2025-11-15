'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { NoticeBoard } from '@/components/NoticeBoard';
import { SuttaButton } from '@/components/SuttaButton';
import { MoodSelector } from '@/components/MoodSelector';
import { GossipSection } from '@/components/GossipSection';
import { FrustrationButtons } from '@/components/FrustrationButtons';
import { NotificationBadge } from '@/components/NotificationBadge';

export default function SpacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [space, setSpace] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'notice' | 'gossip' | 'features'>('notice');

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
      <NotificationBadge />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="card-retro">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-retro-dark mb-2">
                {space.name}
              </h1>
              <p className="text-retro-medium">
                You & {partner?.username}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card-retro">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('notice')}
              className={`px-4 py-2 rounded-retro font-bold transition-all ${
                activeTab === 'notice'
                  ? 'bg-pastel-purple text-white shadow-retro'
                  : 'bg-white/50 text-retro-dark hover:bg-white/80'
              }`}
            >
              📋 Notice Board
            </button>
            <button
              onClick={() => setActiveTab('gossip')}
              className={`px-4 py-2 rounded-retro font-bold transition-all ${
                activeTab === 'gossip'
                  ? 'bg-pastel-purple text-white shadow-retro'
                  : 'bg-white/50 text-retro-dark hover:bg-white/80'
              }`}
            >
              🤫 Gossip
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 rounded-retro font-bold transition-all ${
                activeTab === 'features'
                  ? 'bg-pastel-purple text-white shadow-retro'
                  : 'bg-white/50 text-retro-dark hover:bg-white/80'
              }`}
            >
              ⚡ Features
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'notice' && (
          <NoticeBoard spaceId={resolvedParams.id} userId={user.userId} />
        )}

        {activeTab === 'gossip' && (
          <GossipSection spaceId={resolvedParams.id} userId={user.userId} />
        )}

        {activeTab === 'features' && (
          <div className="space-y-6">
            <SuttaButton spaceId={resolvedParams.id} />
            <MoodSelector spaceId={resolvedParams.id} />
            <FrustrationButtons spaceId={resolvedParams.id} />
          </div>
        )}
      </div>
    </div>
  );
}
