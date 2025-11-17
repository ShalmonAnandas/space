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
      const storedVersion = localStorage.getItem('sw_version');
      const hadNotifications = localStorage.getItem('had_notifications') === 'true';
      const upgradeCompleted = localStorage.getItem('sw_upgrade_completed') === 'true';
      
      // Trigger upgrade if:
      // 1. No stored version (existing user before versioning) OR version changed
      // 2. User had notifications enabled
      // 3. Upgrade hasn't been completed yet
      if (!upgradeCompleted && hadNotifications && (!storedVersion || storedVersion !== SW_VERSION)) {
        // Need to upgrade - unregister old service worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
          console.log('Old service worker unregistered for upgrade');
        }
        setNeedsUpgrade(true);
      }
      
      // Store current version
      localStorage.setItem('sw_version', SW_VERSION);
    };

    checkSWUpgrade();

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Force update check
          registration.update();
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
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
