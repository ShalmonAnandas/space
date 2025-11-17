'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

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
      const response = await fetch('/api/notifications?unreadOnly=true');
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
    <div className="fixed top-4 right-4 z-50">
      <div className="surface-soft surface-glow border border-[rgba(241,126,126,0.28)] px-3 py-1.5 rounded-full flex items-center gap-1 text-xs text-danger">
        <Bell size={14} />
        <span>{unreadCount > 9 ? '9+' : unreadCount}</span>
      </div>
    </div>
  );
}
