'use client';

import { useState } from 'react';
import { Toast } from './Toast';

interface FrustrationButtonsProps {
  spaceId: string;
  partnerName?: string;
}

const VENT_OPTIONS = [
  { type: 'project', label: 'Fuck this project', emoji: '🤬' },
  { type: 'junior', label: 'I hate my junior', emoji: '😠' },
  { type: 'resign', label: "I'm gonna resign", emoji: '😤' },
];

export function FrustrationButtons({ spaceId, partnerName }: FrustrationButtonsProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleClick = async (buttonType: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/spaces/${spaceId}/daily-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buttonType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to notify');
      }

      setShowModal(false);
      setToastMessage(`${partnerName || 'Partner'} notified`);
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
        Vent
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-md-surface-container rounded p-6 max-w-md w-full border border-md-outline-variant" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Vent your frustration</h3>
            <div className="space-y-3">
              {VENT_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleClick(option.type)}
                  disabled={loading}
                  className="btn-retro w-full disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
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
