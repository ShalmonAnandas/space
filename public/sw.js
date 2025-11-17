/* eslint-disable no-restricted-globals */
const SW_VERSION = 'v2';
const CACHE_NAME = 'space-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Install event - version:', SW_VERSION);
  // Take control immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Activate event - clean old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event - version:', SW_VERSION);
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
  console.log('[SW] Service worker activated and ready');
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received at:', new Date().toISOString());
  console.log('[SW] Push event data:', event.data);
  
  if (!event.data) {
    console.log('[SW] Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Parsed push data:', data);
    const { title, body, spaceId } = data;

    const options = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'partner-notification',
      requireInteraction: true, // Keep notification visible until user interacts
      renotify: true, // Vibrate/alert even if replacing existing notification
      data: { spaceId }, // Store spaceId for click handler
    };

    console.log('[SW] Showing notification:', title, options);
    
    event.waitUntil(
      self.registration.showNotification(title, options).then(() => {
        console.log('[SW] Notification shown successfully');
      }).catch(err => {
        console.error('[SW] Failed to show notification:', err);
      })
    );
  } catch (error) {
    console.error('[SW] Error handling push event:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const spaceId = event.notification.data?.spaceId;
  const urlToOpen = spaceId ? `/space/${spaceId}` : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            // Navigate to the space
            return client.navigate(urlToOpen);
          });
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
