const CACHE_NAME = 'organox-helper-v2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(error => {
          console.log('Network fetch failed:', error);
          // Return a fallback response for the main page
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
          throw error;
        });
      })
  );
});

// Background sync for session logs (if supported)
self.addEventListener('sync', event => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'session-sync') {
    event.waitUntil(
      // Could sync session data to server here
      console.log('Session sync completed')
    );
  }
});

// Push notifications (for future enhancements)
self.addEventListener('push', event => {
  console.log('Push received:', event);
  
  const options = {
    body: 'OrganOx Helper notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'organox-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('OrganOx Helper', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});