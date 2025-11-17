'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

interface CachedData {
  notifications: any[];
  timestamp: number;
}

interface SyncModalProps {
  onViewUpdates: () => void;
  onClose: () => void;
}

function SyncModal({ onViewUpdates, onClose }: SyncModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-[rgba(5,7,12,0.72)]">
      <div className="surface-panel max-w-md w-full animate-fade-in">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-[rgba(241,126,126,0.18)] flex items-center justify-center flex-shrink-0">
              <Bell size={20} className="text-danger" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">You missed some updates</h2>
              <p className="text-sm text-neutral-400">
                I&apos;m sorry web apps are difficult I can&apos;t help it.
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-col sm:flex-row">
            <button onClick={onViewUpdates} className="btn-primary flex-1">
              View updates
            </button>
            <button onClick={onClose} className="btn-tertiary flex-1">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationButton() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    checkForUpdates();
    
    // Poll every 30 seconds
    const interval = setInterval(checkForUpdates, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true');
      if (response.ok) {
        const data = await response.json();
        const currentNotifications = data.notifications || [];
        setUnreadCount(currentNotifications.length);
        
        // Check cache for sync issues
        const cachedStr = localStorage.getItem('cached_notifications');
        if (cachedStr) {
          const cached: CachedData = JSON.parse(cachedStr);
          const cachedUnreadIds = cached.notifications
            .filter((n: any) => !n.read)
            .map((n: any) => n.id);
          
          const currentUnreadIds = currentNotifications.map((n: any) => n.id);
          
          // Check if there are new notifications not in cache
          const missedNotifications = currentUnreadIds.filter(
            (id: number) => !cachedUnreadIds.includes(id)
          );
          
          if (missedNotifications.length > 0 && cached.timestamp) {
            // Only show modal if cache is older than 5 minutes and we have missed updates
            const fiveMinutes = 5 * 60 * 1000;
            if (Date.now() - cached.timestamp > fiveMinutes) {
              setShowSyncModal(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const handleViewUpdates = () => {
    setShowSyncModal(false);
    router.push('/notifications');
  };

  const handleClick = () => {
    router.push('/notifications');
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="btn-ghost relative"
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-danger text-[10px] font-semibold flex items-center justify-center text-background-base">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showSyncModal && (
        <SyncModal
          onViewUpdates={handleViewUpdates}
          onClose={() => setShowSyncModal(false)}
        />
      )}
    </>
  );
}
