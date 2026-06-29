const CACHE_NAME = 'billar-tres-bandas-pro-v149-sin-info-card';
const CORE_ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icon-48.png', './icon-72.png', './icon-96.png', './icon-128.png', './icon-144.png', './icon-152.png', './icon-192.png', './icon-384.png', './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const copy = response.clone();
        if (request.method === 'GET' && (request.destination === 'image' || request.url.includes('/assets/jugadas/'))) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      });
    })
  );
});
