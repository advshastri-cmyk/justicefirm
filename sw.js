/* =========================================================
   JusticeFirms.com – Ultra Premium Service Worker
   Platform: GitHub Pages (Static)
   Strategy: Network First + Offline Fallback
   Version: v5
========================================================= */

const CACHE_NAME = 'justicefirms-ultra-v5';

/* Core assets for offline */
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',

  /* Icons */
  '/android-icon-36x36.png',
  '/android-icon-96x96.png',
  '/android-icon-192x192.png',
  '/favicon-512x512.png'
];

/* =========================================================
   INSTALL – Cache core assets
========================================================= */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[JusticeFirms] Installing & caching core assets');
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* =========================================================
   ACTIVATE – Clean old cache
========================================================= */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[JusticeFirms] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* =========================================================
   FETCH – Smart handling
========================================================= */
self.addEventListener('fetch', (event) => {

  /* Only GET requests */
  if (event.request.method !== 'GET') return;

  /* Ignore cross-origin (analytics, ads, etc.) */
  if (!event.request.url.startsWith(self.location.origin)) return;

  /* NAVIGATION REQUESTS (Pages) */
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  /* STATIC ASSETS (CSS, JS, Images) */
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          /* Silent fail for assets */
        });
    })
  );
});
