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
  const [partnerMood, setPartnerMood] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'notice' | 'gossip' | 'features'>('notice');

  useEffect(() => {
    loadSpaceData();
  }, []);

  useEffect(() => {
    if (space && user) {
      loadPartnerMood();
      // Poll for mood updates every 30 seconds
      const interval = setInterval(loadPartnerMood, 30000);
      return () => clearInterval(interval);
    }
  }, [space, user]);

  const loadPartnerMood = async () => {
    try {
      const response = await fetch(`/api/spaces/${resolvedParams.id}/mood`);
      const data = await response.json();
      if (data.partnerMood) {
        setPartnerMood(data.partnerMood);
      } else {
        setPartnerMood(null);
      }
    } catch (error) {
      console.error('Failed to load partner mood:', error);
    }
  };

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
        <div className="card-retro">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-retro-dark mb-2">
                {space.name}
              </h1>
              <p className="text-retro-medium">
                You & {partner?.username}
              </p>
              {partnerMood && (
                <div className="mt-3 bg-white/50 p-3 rounded-retro border-2 border-pastel-purple/30">
                  <p className="text-sm text-retro-medium mb-1">Partner is feeling:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-retro-dark">{partnerMood.mood}</span>
                    <span className="text-xs text-retro-medium">
                      • {new Date(partnerMood.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              Back
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
              Notice Board
            </button>
            <button
              onClick={() => setActiveTab('gossip')}
              className={`px-4 py-2 rounded-retro font-bold transition-all ${
                activeTab === 'gossip'
                  ? 'bg-pastel-purple text-white shadow-retro'
                  : 'bg-white/50 text-retro-dark hover:bg-white/80'
              }`}
            >
              Gossip
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 rounded-retro font-bold transition-all ${
                activeTab === 'features'
                  ? 'bg-pastel-purple text-white shadow-retro'
                  : 'bg-white/50 text-retro-dark hover:bg-white/80'
              }`}
            >
              Features
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
