// Plaza Market — Service Worker (red primero, para no romper las actualizaciones)
const CACHE = 'plaza-market-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Siempre intenta la red primero; si no hay conexión, cae a lo último guardado.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(event.request, copia)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
