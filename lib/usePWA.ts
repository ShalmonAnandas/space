'use client';

import { useEffect, useState } from 'react';

const SW_VERSION = 'v2';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOSDevice(isIOS);

    // Check for service worker upgrade
    const checkSWUpgrade = async () => {
      const upgradeCompleted = localStorage.getItem('sw_v2_upgrade_completed') === 'true';
      
      // Check if user has granted notification permission (indicates they had notifications)
      const hasNotificationPermission = 'Notification' in window && Notification.permission === 'granted';
      
      console.log('SW Upgrade Check:', {
        currentVersion: SW_VERSION,
        hasNotificationPermission,
        upgradeCompleted,
        needsUpgrade: !upgradeCompleted && hasNotificationPermission
      });
      
      // Trigger upgrade if:
      // 1. User has notification permission granted (they had notifications before)
      // 2. v2 Upgrade hasn't been completed yet
      if (!upgradeCompleted && hasNotificationPermission) {
        console.log('🔄 Triggering service worker v2 upgrade');
        
        // Need to upgrade - unregister old service worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          console.log(`Unregistering ${registrations.length} service worker(s)`);
          for (const registration of registrations) {
            await registration.unregister();
          }
          console.log('✅ Old service worker unregistered for upgrade');
        }
        setNeedsUpgrade(true);
        return;
      }
    };

    checkSWUpgrade();

    // Register service worker - with delay if upgrade just happened
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          // Small delay to ensure clean state after unregister
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
          
          // Force update check
          registration.update();
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };
      
      registerSW();
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
      return true;
    }
    
    return false;
  };

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    isIOSDevice,
    installApp,
    needsUpgrade,
  };
}
