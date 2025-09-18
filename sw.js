// sw.js — Service Worker for OrganOx Error Helper
// Version bump: v2

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('organox-codes-v2').then((cache) =>
      cache.addAll([
        './index.html',
        './manifest.json'
      ])
    )
  );
});

// Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request);
    })
  );
});