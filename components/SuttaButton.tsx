"use client";

import { useCallback, useEffect, useState } from 'react';

interface SuttaButtonProps {
  spaceId: string;
}

export function SuttaButton({ spaceId }: SuttaButtonProps) {
  const [loading, setLoading] = useState(false);
  const [lastClick, setLastClick] = useState<Date | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadClickData = useCallback(async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/daily-click?buttonType=sutta`);
      const data = await response.json();

      if (data.lastClickAt) {
        setLastClick(new Date(data.lastClickAt));
      }
      if (data.clickCount !== undefined) {
        setClickCount(data.clickCount);
      }
    } catch (err) {
      console.error('Failed to load click data:', err);
    }
  }, [spaceId]);

  useEffect(() => {
    loadClickData();
  }, [loadClickData]);

  const isNewDay = (date: Date) => {
    const now = new Date();
    return (
      now.getDate() !== date.getDate() ||
      now.getMonth() !== date.getMonth() ||
      now.getFullYear() !== date.getFullYear()
    );
  };

  const handleClick = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/spaces/${spaceId}/daily-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buttonType: 'sutta' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to click button');
      }

      setMessage(data.message || 'Sutta clicked!');
      await loadClickData();

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canClick = !lastClick || isNewDay(lastClick);

  const getTimeUntilReset = () => {
    if (!lastClick || canClick) return null;

    const tomorrow = new Date(lastClick);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="card-retro">
      <h3 className="text-xl font-semibold mb-3">Sutta Button</h3>
      <p className="text-sm opacity-80 mb-4">
        Click once daily to let your partner know you are thinking of them. Click multiple times to
        send an SOS!
      </p>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleClick}
          disabled={loading || !canClick}
          className={`btn-retro flex-1 text-lg py-4 ${
            !canClick ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? '...' : canClick ? 'Sutta Break' : 'Already Clicked Today'}
        </button>
      </div>

      {clickCount > 0 && (
        <div className="bg-md-surface-container-high p-3 rounded border border-md-outline-variant mb-3">
          <p className="text-sm">
            Clicks today: <span className="font-semibold">{clickCount}</span>
            {clickCount > 1 && ' (SOS mode!)'}
          </p>
        </div>
      )}

      {!canClick && getTimeUntilReset() && (
        <div className="bg-md-primary-container text-md-on-primary-container rounded p-3 mb-3 border border-md-outline-variant">
          <p className="text-sm">⏳ Resets in: {getTimeUntilReset()}</p>
        </div>
      )}

      {message && (
        <div className="bg-md-tertiary-container text-md-on-tertiary-container border border-md-outline-variant rounded p-3 mb-3">
          <p className="text-sm">✅ {message}</p>
        </div>
      )}

      {error && (
        <div className="bg-md-error-container text-md-on-error-container border border-md-outline-variant rounded p-3">
          <p className="text-sm">❌ {error}</p>
        </div>
      )}

      <div className="bg-md-surface-container-high border border-md-outline-variant rounded p-3 mt-4">
        <p className="text-xs opacity-80">
          First click = normal notification. Additional clicks = SOS notification!
        </p>
      </div>
    </div>
  );
}
