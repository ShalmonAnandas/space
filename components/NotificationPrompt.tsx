'use client';

import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/lib/usePushNotifications';
import { usePWA } from '@/lib/usePWA';
import { BellPlus, BellOff, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export function NotificationPrompt() {
  const { isSupported, isSubscribed, permission, subscribe } = usePushNotifications();
  const { needsUpgrade } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpgrade, setIsUpgrade] = useState(false);

  useEffect(() => {
    console.log('NotificationPrompt useEffect:', {
      needsUpgrade,
      isSupported,
      isSubscribed,
      permission,
      upgradeCompleted: localStorage.getItem('sw_upgrade_completed')
    });
    
    // Check if this is an upgrade scenario
    if (needsUpgrade && isSupported) {
      const upgradeCompleted = localStorage.getItem('sw_upgrade_completed');
      if (!upgradeCompleted) {
        console.log('Showing upgrade prompt');
        setShowPrompt(true);
        setIsUpgrade(true);
        return;
      }
    }
    
    // Regular notification prompt for new users
    if (isSupported && !isSubscribed && permission === 'default') {
      console.log('Showing regular notification prompt');
      setShowPrompt(true);
    }
  }, [isSupported, isSubscribed, permission, needsUpgrade]);

  const handleEnable = async () => {
    setIsLoading(true);
    const success = await subscribe();
    setIsLoading(false);
    
    if (success) {
      if (isUpgrade) {
        localStorage.setItem('sw_upgrade_completed', 'true');
        localStorage.setItem('sw_version', 'v2');
      }
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    if (isUpgrade) {
      localStorage.setItem('sw_upgrade_completed', 'true');
    }
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
            ) : isUpgrade ? (
              <RefreshCw size={22} className="text-accent-strong" />
            ) : (
              <BellPlus size={22} className="text-accent-strong" />
            )}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              {isUpgrade ? 'Notifications upgraded!' : 'Enable notifications'}
            </h2>
            <p className="text-sm text-neutral-400">
              {isUpgrade 
                ? "We've improved notifications to work even when the app is closed. Please allow notifications again to continue receiving updates."
                : 'Get a soft ping whenever your space comes alive—new gossip, mood shifts, or a quick sutta break alert.'
              }
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
                <span>{isUpgrade ? 'Upgrading' : 'Enabling'}</span>
              </>
            ) : (
              <>
                {isUpgrade ? <RefreshCw size={18} /> : <BellPlus size={18} />}
                <span>{isUpgrade ? 'Allow notifications' : 'Enable notifications'}</span>
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
