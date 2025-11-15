'use client';

import { useEffect, useState } from 'react';

interface MoodSelectorProps {
  spaceId: string;
}

const MOODS = [
  { value: 'Happy', emoji: '😊', color: 'bg-pastel-yellow' },
  { value: 'Frustrated', emoji: '😤', color: 'bg-pastel-pink' },
  { value: 'Lost', emoji: '😕', color: 'bg-pastel-purple' },
  { value: 'Okay', emoji: '😐', color: 'bg-pastel-blue' },
  { value: 'Tired', emoji: '😴', color: 'bg-pastel-peach' },
  { value: 'Excited', emoji: '🤩', color: 'bg-pastel-green' },
  { value: 'Anxious', emoji: '😰', color: 'bg-pastel-pink-light' },
  { value: 'Calm', emoji: '😌', color: 'bg-pastel-blue-light' },
];

export function MoodSelector({ spaceId }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [partnerMood, setPartnerMood] = useState<any>(null);

  useEffect(() => {
    loadPartnerMood();
    const interval = setInterval(loadPartnerMood, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [spaceId]);

  const loadPartnerMood = async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/mood`);
      const data = await response.json();

      if (data.partnerMood) {
        setPartnerMood(data.partnerMood);
      } else {
        setPartnerMood(null);
      }
    } catch (err) {
      console.error('Failed to load partner mood:', err);
    }
  };

  const handleMoodSelect = async (mood: string) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/spaces/${spaceId}/mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set mood');
      }

      setSelectedMood(mood);
      setMessage('Mood shared with your partner! 💫');
      await loadPartnerMood();

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMoodInfo = (moodValue: string) => {
    return MOODS.find((m) => m.value === moodValue);
  };

  return (
    <div className="card-retro">
      <h3 className="text-xl font-bold text-retro-dark mb-3">💭 Mood Share</h3>
      <p className="text-sm text-retro-medium mb-4">
        Share how you're feeling right now. Your partner will be notified!
      </p>

      {/* Partner's Mood */}
      {partnerMood && (
        <div className="bg-white/50 p-4 rounded-retro border-2 border-pastel-purple/30 mb-4">
          <p className="text-sm text-retro-medium mb-1">Your partner is feeling:</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{getMoodInfo(partnerMood.mood)?.emoji}</span>
            <span className="text-lg font-bold text-retro-dark">{partnerMood.mood}</span>
          </div>
          <p className="text-xs text-retro-medium mt-1">
            Shared {new Date(partnerMood.createdAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Mood Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            disabled={loading}
            className={`${mood.color} p-4 rounded-retro border-2 ${
              selectedMood === mood.value
                ? 'border-retro-dark shadow-retro scale-105'
                : 'border-transparent hover:border-retro-medium'
            } transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-3xl mb-1">{mood.emoji}</div>
            <div className="text-sm font-bold text-retro-dark">{mood.value}</div>
          </button>
        ))}
      </div>

      {message && (
        <div className="bg-green-100 border-2 border-green-300 rounded-retro p-3 mb-3">
          <p className="text-green-700 text-sm">✅ {message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-2 border-red-300 rounded-retro p-3 mb-3">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      <div className="bg-pastel-purple/20 rounded-retro p-3">
        <p className="text-xs text-retro-medium">
          💡 Moods are stored for 24 hours. Share whenever your feelings change!
        </p>
      </div>
    </div>
  );
}
