'use client';

import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/lib/usePushNotifications';
import { BellPlus, BellOff } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-[rgba(5,7,12,0.72)]">
      <div className="surface-panel max-w-md w-full space-y-5 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-full bg-[rgba(124,143,255,0.18)] flex items-center justify-center">
            {permission === 'denied' ? (
              <BellOff size={22} className="text-danger" />
            ) : (
              <BellPlus size={22} className="text-accent-strong" />
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Enable notifications</h2>
            <p className="text-sm text-neutral-400">
              Get a soft ping whenever your space comes alive&mdash;new gossip, mood shifts, or a quick sutta break alert.
            </p>
          </div>
        </div>

        <ul className="space-y-2 text-sm text-neutral-300 bg-[rgba(255,255,255,0.03)] border border-surface-border rounded-xl p-4">
          <li>Fresh gossip drops in your spaces</li>
          <li>Partner mood check-ins and updates</li>
          <li>Sutta break prompts that need eyes</li>
          <li>Critical notices you should not miss</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? (
              <>
                <Spinner size={18} />
                <span>Enabling</span>
              </>
            ) : (
              <>
                <BellPlus size={18} />
                <span>Enable notifications</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="btn-tertiary"
          >
            Maybe later
          </button>
        </div>

        {permission === 'denied' && (
          <div className="surface-soft border border-[rgba(241,126,126,0.32)] text-sm text-danger rounded-xl p-4">
            Notifications are blocked in your browser. Head to settings to re-enable them.
          </div>
        )}
      </div>
    </div>
  );
}
