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

// ---- Notificaciones push ----
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Plaza Market';
  const options = {
    body: data.body || 'Tenés una novedad en Plaza Market.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/plaza-market-mensajes.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) { c.navigate(url); return c.focus(); } }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
