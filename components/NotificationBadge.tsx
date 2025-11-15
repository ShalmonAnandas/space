'use client';

import { useEffect, useState } from 'react';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.notifications?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg z-50">
      {unreadCount > 9 ? '9+' : unreadCount}
    </div>
  );
}
