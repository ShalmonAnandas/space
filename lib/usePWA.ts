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
      const upgradeCompleted = localStorage.getItem('sw_upgrade_completed') === 'true';
      const hadNotifications = localStorage.getItem('had_notifications') === 'true';
      
      // Check if user has an active push subscription
      let hasActiveSubscription = false;
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            hasActiveSubscription = !!subscription;
          }
        } catch (e) {
          console.error('Error checking subscription:', e);
        }
      }
      
      // Check if user has granted notification permission (indicates they had notifications)
      const hasNotificationPermission = 'Notification' in window && Notification.permission === 'granted';
      
      const shouldUpgrade = hasActiveSubscription || hadNotifications || hasNotificationPermission;
      const versionMismatch = !storedVersion || storedVersion !== SW_VERSION;
      
      console.log('SW Upgrade Check:', {
        storedVersion,
        currentVersion: SW_VERSION,
        hasActiveSubscription,
        hadNotifications,
        hasNotificationPermission,
        shouldUpgrade,
        upgradeCompleted,
        versionMismatch,
        needsUpgrade: !upgradeCompleted && shouldUpgrade && versionMismatch
      });
      
      // Trigger upgrade if:
      // 1. Version mismatch (no stored version OR different version)
      // 2. User has active subscription OR had notifications OR has permission granted
      // 3. Upgrade hasn't been completed yet
      if (!upgradeCompleted && shouldUpgrade && versionMismatch) {
        console.log('🔄 Triggering service worker upgrade');
        
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
        // Don't store version yet - wait for upgrade completion
        return;
      }
      
      // Store current version only if not upgrading
      if (storedVersion !== SW_VERSION) {
        localStorage.setItem('sw_version', SW_VERSION);
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
