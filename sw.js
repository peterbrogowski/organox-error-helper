
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('organox-codes-v1').then((cache) => cache.addAll([
      './OrganOx_Error_Code_Helper_v1.1.html',
      './manifest.json'
    ]))
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
