// Mazel Service Worker — network-first, minimal caching to avoid blank screens
const CACHE = 'mazel-v2';

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Always go to network first — never serve stale app shell
  e.respondWith(
    fetch(e.request).catch(() => {
      // Offline fallback only for navigation (show the cached home page)
      if (e.request.mode === 'navigate') {
        return caches.match('/') || new Response('App is offline. Please reconnect.', {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    })
  );
});
