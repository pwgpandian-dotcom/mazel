// Mazel Service Worker — network-first for product/order data, cache-first for static assets
const CACHE = 'mazel-v1';
const STATIC = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Network-first for API, Supabase, and page navigations (fresh order/product data always)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co') || e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for static assets (_next/static, fonts, images)
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/fonts') || url.pathname.match(/\.(ico|png|svg|jpg|webp|woff2?)$/)) {
    e.respondWith(
      caches.match(e.request).then(cached => cached ?? fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }

  // Default: network with cache fallback
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
