"use client";

import { useState } from 'react';
import { Toast } from './Toast';
import { AlarmClock } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface SuttaButtonProps {
  spaceId: string;
  partnerName?: string;
}

export function SuttaButton({ spaceId, partnerName }: SuttaButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleClick = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/spaces/${spaceId}/daily-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buttonType: 'sutta' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to notify');
      }

      setToastMessage(`${partnerName || 'Partner'} notified`);
      setShowToast(true);
    } catch (err: any) {
      setToastMessage(err.message);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleClick} disabled={loading} className="btn-tertiary">
        {loading ? (
          <>
            <Spinner size={16} />
            <span>Notifying</span>
          </>
        ) : (
          <>
            <AlarmClock size={16} />
            <span>Sutta</span>
          </>
        )}
      </button>
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </>
  );
}
