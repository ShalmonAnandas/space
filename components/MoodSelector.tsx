"use client";

import { useCallback, useEffect, useState } from 'react';

interface MoodSelectorProps {
  spaceId: string;
}

const MOODS = [
  { value: 'Happy', emoji: '', color: 'bg-pastel-yellow' },
  { value: 'Frustrated', emoji: '', color: 'bg-pastel-pink' },
  { value: 'Lost', emoji: '', color: 'bg-pastel-purple' },
  { value: 'Okay', emoji: '', color: 'bg-pastel-blue' },
  { value: 'Tired', emoji: '', color: 'bg-pastel-peach' },
  { value: 'Excited', emoji: '', color: 'bg-pastel-green' },
  { value: 'Anxious', emoji: '', color: 'bg-pastel-pink-light' },
  { value: 'Calm', emoji: '', color: 'bg-pastel-blue-light' },
];

export function MoodSelector({ spaceId }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [partnerMood, setPartnerMood] = useState<any>(null);

  const loadPartnerMood = useCallback(async () => {
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
  }, [spaceId]);

  useEffect(() => {
    loadPartnerMood();
    const interval = setInterval(loadPartnerMood, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [loadPartnerMood]);

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
      setMessage('Mood shared with your partner!');
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
      <h3 className="text-xl font-semibold mb-3">Mood Share</h3>
      <p className="text-sm opacity-80 mb-4">
        Share how you are feeling right now. Your partner will be notified!
      </p>

      {/* Partner's Mood */}
      {partnerMood && (
        <div className="bg-md-surface-container-high p-4 rounded border border-md-outline-variant mb-4">
          <p className="text-sm opacity-70 mb-1">Your partner is feeling:</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{getMoodInfo(partnerMood.mood)?.emoji}</span>
            <span className="text-lg font-semibold">{partnerMood.mood}</span>
          </div>
          <p className="text-xs opacity-70 mt-1">
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
            className={`bg-md-surface-container-high hover:bg-md-surface-container-highest p-4 rounded border ${
              selectedMood === mood.value
                ? 'border-md-primary ring-2 ring-md-primary/20'
                : 'border-md-outline-variant'
            } transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-3xl mb-1">{mood.emoji}</div>
            <div className="text-sm font-semibold">{mood.value}</div>
          </button>
        ))}
      </div>

      {message && (
        <div className="bg-md-tertiary-container text-md-on-tertiary-container border border-md-outline-variant rounded p-3 mb-3">
          <p className="text-sm">✅ {message}</p>
        </div>
      )}

      {error && (
        <div className="bg-md-error-container text-md-on-error-container border border-md-outline-variant rounded p-3 mb-3">
          <p className="text-sm">❌ {error}</p>
        </div>
      )}

      <div className="bg-md-surface-container-high border border-md-outline-variant rounded p-3">
        <p className="text-xs opacity-80">
          Moods are stored for 24 hours. Share whenever your feelings change!
        </p>
      </div>
    </div>
  );
}
