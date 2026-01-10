/* =========================================================
   JusticeFirms.com – Ultra Premium Service Worker (FINAL)
   Platform: GitHub Pages (Static)
   Strategy: Network First (Pages) + Cache First (Assets)
   Offline Rule: ONLY offline.html (No cached pages)
   Version: v6
========================================================= */

const CACHE_NAME = 'justicefirms-ultra-v6';

/* Core assets strictly required offline */
const CORE_ASSETS = [
  '/offline.html',
  '/manifest.json',

  /* Icons */
  '/android-icon-36x36.png',
  '/android-icon-96x96.png',
  '/android-icon-192x192.png',
  '/favicon-512x512.png'
];

/* =========================================================
   INSTALL – Cache only critical offline assets
========================================================= */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* =========================================================
   ACTIVATE – Remove old caches
========================================================= */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* =========================================================
   FETCH – STRICT PROFESSIONAL LOGIC
========================================================= */
self.addEventListener('fetch', (event) => {

  /* Handle only GET requests */
  if (event.request.method !== 'GET') return;

  /* Ignore third-party requests */
  if (!event.request.url.startsWith(self.location.origin)) return;

  /* ================================
     PAGE NAVIGATION (HTML)
     ================================ */
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response; // ONLINE → real site
        })
        .catch(() => {
          return caches.match('/offline.html'); // OFFLINE → ONLY offline page
        })
    );
    return;
  }

  /* ================================
     STATIC FILES (CSS, JS, Images)
     ================================ */
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          /* Asset fail silently (no UI confusion) */
        });
    })
  );
});
