// Plaza Market — Service Worker (red primero, HTML siempre fresco)
const CACHE = 'plaza-market-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// HTML/paginas: SIEMPRE red fresca (bypass del cache del navegador). Resto: red primero.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const esHTML = event.request.mode === 'navigate' || event.request.destination === 'document';
  const pedido = esHTML ? new Request(event.request.url, { cache: 'reload' }) : event.request;
  event.respondWith(
    fetch(pedido).then((resp) => {
      const copia = resp.clone();
      caches.open(CACHE).then((c) => c.put(event.request, copia)).catch(() => {});
      return resp;
    }).catch(() => caches.match(event.request))
  );
});

// ---- Notificaciones push ----
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Plaza Market';
  const options = {
    body: data.body || 'Tenes una novedad en Plaza Market.',
    icon: '/icon-192.png',
    badge: '/badge-96.png',
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
