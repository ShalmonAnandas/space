'use client';

import { useState } from 'react';
import { Toast } from './Toast';
import { AlertTriangle, Briefcase, UserX, LogOut, X } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface FrustrationButtonsProps {
  spaceId: string;
  partnerName?: string;
}

const VENT_OPTIONS = [
  { type: 'project', label: 'This project is cursed', icon: Briefcase },
  { type: 'junior', label: 'My junior is chaos', icon: UserX },
  { type: 'resign', label: 'I might resign today', icon: LogOut },
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
      <button onClick={() => setShowModal(true)} className="btn-tertiary">
        <AlertTriangle size={16} />
        <span>Vent</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-[rgba(5,7,12,0.72)]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="surface-panel max-w-md w-full space-y-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Vent your frustration</h3>
                <p className="text-sm text-neutral-400">
                  Trigger a discreet alert so they know you need a minute.
                </p>
              </div>
              <button className="btn-ghost" onClick={() => setShowModal(false)} aria-label="Close vent modal">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {VENT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => handleClick(option.type)}
                    disabled={loading}
                    className="surface-soft surface-glow p-4 w-full rounded-xl border border-[rgba(124,143,255,0.16)] hover:border-[rgba(241,126,126,0.4)] transition disabled:opacity-60 flex items-center gap-3"
                  >
                    {loading ? <Spinner size={18} /> : <Icon size={20} className="text-danger" />}
                    <span className="text-sm text-neutral-200">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
