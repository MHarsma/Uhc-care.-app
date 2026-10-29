// Service Worker for UHC Care PWA (v7: Fresh Network-First Lifecycle, Zero Stale Page Caching)
const CACHE_NAME = 'uhc-care-v7';

// Only cache pure immutable assets, NEVER HTML pages or auth state
const STATIC_ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Failed to cache asset:', url, err);
          })
        )
      );
    })
  );
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Allow client to request showing a notification via SW registration
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || 'UHC Care', {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        ...options,
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  // Purge ALL old caches to ensure zero stale pages remain
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Purging old cache version:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// Push notification received from Web Push / server
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'UHC Care', body: event.data.text() };
    }
  }

  const title = data.title || 'UHC Care';
  const options = {
    body: data.body || data.message || 'New update from your partner in UHC Care',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Click handler for notifications: focus or navigate to relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. NEVER intercept or cache API requests, auth routes, or external services
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/auth/') ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  // 2. Navigation requests (HTML pages): ALWAYS fetch from network!
  // Never cache HTML so users never see yesterday's frozen screen or stale state
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).catch(() => {
        // Only if device is totally offline without internet, check cache
        return caches.match(event.request);
      })
    );
    return;
  }

  // 3. Static immutable assets (_next/static, images, icons): Cache with network fallback
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.json');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Default: pass directly to network
  event.respondWith(fetch(event.request));
});
