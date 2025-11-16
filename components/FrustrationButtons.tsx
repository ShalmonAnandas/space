'use client';

import { useEffect, useState } from 'react';

interface FrustrationButtonsProps {
  spaceId: string;
}

interface ClickStatus {
  buttonType: string;
  lastClickAt: string | null;
  canClick: boolean;
}

export function FrustrationButtons({ spaceId }: FrustrationButtonsProps) {
  const [status, setStatus] = useState<Record<string, ClickStatus>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const buttons = [
    { type: 'project', label: 'Project Frustration', emoji: '', color: 'bg-pastel-pink' },
    { type: 'junior', label: 'Junior Frustration', emoji: '', color: 'bg-pastel-purple' },
    { type: 'resign', label: 'Resign Frustration', emoji: '', color: 'bg-pastel-peach' },
  ];

  useEffect(() => {
    loadAllStatus();
  }, [spaceId]);

  const loadAllStatus = async () => {
    for (const button of buttons) {
      await loadStatus(button.type);
    }
  };

  const loadStatus = async (buttonType: string) => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/daily-click?buttonType=${buttonType}`);
      const data = await response.json();

      setStatus((prev) => ({
        ...prev,
        [buttonType]: {
          buttonType,
          lastClickAt: data.lastClickAt || null,
          canClick: data.canClick ?? true,
        },
      }));
    } catch (err) {
      console.error(`Failed to load ${buttonType} status:`, err);
    }
  };

  const handleClick = async (buttonType: string) => {
    setLoading((prev) => ({ ...prev, [buttonType]: true }));
    setErrors((prev) => ({ ...prev, [buttonType]: '' }));
    setMessages((prev) => ({ ...prev, [buttonType]: '' }));

    try {
      const response = await fetch(`/api/spaces/${spaceId}/daily-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buttonType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to click button');
      }

      setMessages((prev) => ({
        ...prev,
        [buttonType]: data.message || 'Partner notified!',
      }));

      await loadStatus(buttonType);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessages((prev) => ({ ...prev, [buttonType]: '' }));
      }, 3000);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, [buttonType]: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [buttonType]: false }));
    }
  };

  const getTimeUntilReset = (lastClickAt: string | null) => {
    if (!lastClickAt) return null;

    const lastClick = new Date(lastClickAt);
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
      <h3 className="text-xl font-semibold mb-3">Frustration Buttons</h3>
      <p className="text-sm opacity-80 mb-4">
        Vent your frustrations! Click anytime to notify your partner. They will understand.
      </p>

      <div className="space-y-3">
        {buttons.map((button) => {
          const buttonStatus = status[button.type];
          const canClick = buttonStatus?.canClick ?? true;
          const isLoading = loading[button.type];
          const message = messages[button.type];
          const error = errors[button.type];

          return (
            <div key={button.type} className="border-l-4 border-md-primary pl-4 py-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold">{button.label}</h4>
                </div>
              </div>

              <button
                onClick={() => handleClick(button.type)}
                disabled={isLoading}
                className="btn-retro w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '...' : 'Click to Vent'}
              </button>

              {message && (
                <div className="bg-md-tertiary-container text-md-on-tertiary-container border border-md-outline-variant rounded p-2 mt-2">
                  <p className="text-xs">{message}</p>
                </div>
              )}

              {error && (
                <div className="bg-md-error-container text-md-on-error-container border border-md-outline-variant rounded p-2 mt-2">
                  <p className="text-xs">{error}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border border-md-outline-variant rounded p-3 mt-4 bg-md-surface-container-high">
        <p className="text-xs opacity-80">
          Each button can be clicked anytime. Your partner will receive a notification with
          the specific frustration type!
        </p>
      </div>
    </div>
  );
}
