'use client';

import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/lib/usePushNotifications';

export function NotificationPrompt() {
  const { isSupported, isSubscribed, permission, subscribe } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show prompt if notifications are supported and not subscribed
    if (isSupported && !isSubscribed && permission !== 'denied') {
      setShowPrompt(true);
    }
  }, [isSupported, isSubscribed, permission]);

  const handleEnable = async () => {
    setIsLoading(true);
    const success = await subscribe();
    setIsLoading(false);
    
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card-retro max-w-md w-full">
        <h2 className="text-2xl font-bold text-retro-dark mb-4">
          🔔 Enable Notifications
        </h2>
        <p className="text-retro-dark mb-4">
          Notifications are essential for this app! You'll get instant updates when:
        </p>
        <ul className="list-disc list-inside text-retro-dark mb-6 space-y-2">
          <li>Your partner posts on the Notice Board</li>
          <li>Your partner sends you gossip</li>
          <li>Your partner shares their mood</li>
          <li>Your partner clicks the Sutta button (SOS)</li>
          <li>Your partner needs support</li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? 'Enabling...' : '✅ Enable Notifications'}
          </button>
          <button
            onClick={handleDismiss}
            className="btn-secondary"
          >
            Later
          </button>
        </div>
        {permission === 'denied' && (
          <div className="bg-red-100 border-2 border-red-300 rounded-retro p-3 mt-4">
            <p className="text-red-700 text-sm">
              ⚠️ Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
