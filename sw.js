const CACHE_NAME = 'justice-firms-premium-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/android-icon-36x36.png',
  '/android-icon-96x96.png',
  '/android-icon-192x192.png',
  '/favicon-512x512.png',
  // Agar aapke paas CSS/JS files hain toh unhe yahan add karein, jaise:
  // '/style.css',
  // '/main.js'
];

// 1. INSTALL: Assets ko cache mein save karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Premium PWA: Caching Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Purane cache ko remove karna (Very Important for updates)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Premium PWA: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Stale-While-Revalidate Strategy
// Pehle cache dikhayega, phir background mein network se update karega
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Agar response valid hai toh cache mein update karein
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Agar network fail ho jaye aur cache mein bhi na ho (Offline fallback)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
