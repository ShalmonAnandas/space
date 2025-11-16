"use client";

import { useState } from 'react';
import { Toast } from './Toast';

interface MoodSelectorProps {
  spaceId: string;
  partnerName?: string;
}

const MOODS = [
  { value: 'Happy', emoji: '😊' },
  { value: 'Sad', emoji: '😢' },
  { value: 'Frustrated', emoji: '😤' },
  { value: 'Lost', emoji: '😵' },
  { value: 'Okay', emoji: '😐' },
  { value: 'Tired', emoji: '😴' },
  { value: 'Excited', emoji: '🤩' },
  { value: 'Anxious', emoji: '😰' },
  { value: 'Calm', emoji: '😌' },
];

const MOOD_MESSAGES: Record<string, string> = {
  Happy: 'happiness',
  Sad: 'sadness',
  Frustrated: 'frustration',
  Lost: 'confusion',
  Okay: 'neutral mood',
  Tired: 'tiredness',
  Excited: 'excitement',
  Anxious: 'anxiety',
  Calm: 'calmness',
};

export function MoodSelector({ spaceId, partnerName }: MoodSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleMoodSelect = async (mood: string) => {
    setLoading(true);

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

      setShowModal(false);
      const moodType = MOOD_MESSAGES[mood] || 'mood';
      setToastMessage(`${partnerName || 'Partner'} has been notified of your ${moodType}`);
      setShowToast(true);
    } catch (err: any) {
      setToastMessage(err.message);
      setShowToast(true);
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-secondary"
      >
        Mood
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-md-surface-container rounded p-6 max-w-md w-full border border-md-outline-variant" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">How are you feeling?</h3>
            <div className="grid grid-cols-3 gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  disabled={loading}
                  className="bg-md-surface-container-high hover:bg-md-surface-container-highest p-4 rounded border border-md-outline-variant transition-all disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs">{mood.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
