'use client';

import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/lib/usePushNotifications';

export function NotificationPrompt() {
  const { isSupported, isSubscribed, permission, subscribe } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show prompt only if notifications are supported, not subscribed, and permission is not granted or denied
    if (isSupported && !isSubscribed && permission === 'default') {
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="card-retro max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">
          Enable Notifications
        </h2>
        <p className="mb-4">
          Notifications are essential for this app! You&apos;ll get instant updates when:
        </p>
        <ul className="list-disc list-inside mb-6 space-y-2 opacity-90">
          <li>New gossips</li>
          <li>When they share their mood</li>
          <li>During their sutta breaks (SOS)</li>
          <li>When they wanna resign</li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </button>
          <button
            onClick={handleDismiss}
            className="btn-secondary"
          >
            Later
          </button>
        </div>
        {permission === 'denied' && (
          <div className="bg-md-error-container text-md-on-error-container border border-md-outline-variant rounded p-3 mt-4">
            <p className="text-sm">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
