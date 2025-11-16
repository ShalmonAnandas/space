"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from './Toast';
import {
  Smile,
  Frown,
  Flame,
  HelpCircle,
  Meh,
  Moon,
  Sparkles,
  AlertTriangle,
  Waves,
  X,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface MoodSelectorProps {
  spaceId: string;
  partnerName?: string;
}

const MOODS = [
  { value: 'Happy', icon: Smile },
  { value: 'Sad', icon: Frown },
  { value: 'Frustrated', icon: Flame },
  { value: 'Lost', icon: HelpCircle },
  { value: 'Okay', icon: Meh },
  { value: 'Tired', icon: Moon },
  { value: 'Excited', icon: Sparkles },
  { value: 'Anxious', icon: AlertTriangle },
  { value: 'Calm', icon: Waves },
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
  const [pendingMood, setPendingMood] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMoodSelect = async (mood: string) => {
    setPendingMood(mood);

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
      setPendingMood(null);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn-secondary">
        <Sparkles size={16} />
        <span>Mood</span>
      </button>

      {showModal && isMounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs bg-[rgba(5,7,12,0.7)]"
            onClick={() => setShowModal(false)}
          >
            <div
              className="surface-panel max-w-md w-full space-y-5 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">How are you feeling?</h3>
                  <p className="text-sm text-neutral-400">
                    Pick a mood and we&apos;ll tap your partner with a subtle nudge.
                  </p>
                </div>
                <button className="btn-ghost" onClick={() => setShowModal(false)} aria-label="Close mood selector">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {MOODS.map((mood) => {
                  const Icon = mood.icon;
                  const isLoading = pendingMood === mood.value;
                  return (
                    <button
                      key={mood.value}
                      onClick={() => handleMoodSelect(mood.value)}
                      disabled={pendingMood !== null}
                      className="surface-soft surface-glow p-4 rounded-xl border border-[rgba(124,143,255,0.16)] hover:border-[rgba(124,143,255,0.32)] transition-transform disabled:opacity-60 flex flex-col items-center gap-2"
                    >
                      {isLoading ? <Spinner size={20} /> : <Icon size={22} className="text-accent-strong" />}
                      <span className="text-xs text-neutral-200">{mood.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
