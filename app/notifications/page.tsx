'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ArrowLeft, Clock } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';

interface Notification {
  id: number;
  type: string;
  content: any;
  read: boolean;
  createdAt: string;
  space: {
    name: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      
      // Cache notifications in localStorage
      localStorage.setItem('cached_notifications', JSON.stringify({
        notifications: data.notifications || [],
        timestamp: Date.now(),
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      
      // Update cache
      const cached = localStorage.getItem('cached_notifications');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        parsedCache.notifications = parsedCache.notifications.map((n: Notification) =>
          n.id === id ? { ...n, read: true } : n
        );
        localStorage.setItem('cached_notifications', JSON.stringify(parsedCache));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNotificationText = (notif: Notification) => {
    const { type, content } = notif;
    const name = content.name || 'Your partner';

    switch (type) {
      case 'sutta_normal':
        return `${name} is on a sutta break`;
      case 'sutta_sos':
        return `SOS: ${name} is slipping and needs help!`;
      case 'mood':
        return `${name} is feeling ${content.mood}`;
      case 'gossip':
        return `${name} has new gossip for you`;
      case 'frustration':
        const frustMap: Record<string, string> = {
          project: 'wants to quit this project',
          junior: 'hates their junior right now',
          resign: 'is thinking about resigning',
        };
        return `${name} ${frustMap[content.frustration] || 'is frustrated'}`;
      case 'notice_seen':
        return `${name} read your notice`;
      case 'vent':
        return content.ventText || `${name} needs to vent`;
      case 'gossip_reaction':
        return `${name} reacted to your gossip`;
      default:
        return 'New notification';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="page-shell">
        <header className="surface-panel animate-fade-in">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="btn-ghost"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-accent-soft" />
                <h1 className="text-3xl font-semibold tracking-tight">
                  Notifications
                </h1>
              </div>
              <p className="text-sm text-neutral-400">
                Your notification history and updates
              </p>
            </div>
          </div>
        </header>

        <section className="surface-panel animate-fade-in">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={80} className="bg-surface-soft" />
              ))}
            </div>
          ) : error ? (
            <div className="surface-soft surface-glow p-8 text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-[rgba(241,126,126,0.14)] flex items-center justify-center">
                <Bell size={26} className="text-danger" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Failed to load notifications</h3>
                <p className="text-sm text-neutral-400">{error}</p>
              </div>
              <button onClick={loadNotifications} className="btn-secondary">
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="surface-soft surface-glow p-8 text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-[rgba(124,143,255,0.14)] flex items-center justify-center">
                <Bell size={26} className="text-accent-strong" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">All caught up</h3>
                <p className="text-sm text-neutral-400">
                  You have no notifications yet. Check back later!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`tile cursor-pointer ${
                    !notif.read ? 'border-accent-soft/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className={`h-2 w-2 rounded-full mt-2 ${
                          notif.read ? 'bg-surface-border' : 'bg-accent-strong'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {getNotificationText(notif)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-neutral-400">
                              {notif.space.name}
                            </span>
                            <span className="text-neutral-500">•</span>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatTime(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
