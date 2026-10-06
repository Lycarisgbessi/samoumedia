/* Service Worker SAMOU MÉDIA
   - Cache des ressources statiques (JS/CSS/images versionnées)
   - Notifications push : nouvel article publié */

const STATIC_CACHE = 'samou-static-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k.startsWith('samou-') && k !== STATIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache-first pour les ressources versionnées (contenu immuable)
  if (event.request.method === 'GET' && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname === '/logo.jpg')) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(response => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
      )
    );
  }
  // Tout le reste (HTML, API) : réseau direct — jamais de cache pour l'actualité
});

// ── Notifications push ──
self.addEventListener('push', (event) => {
  let data = { title: 'SAMOU MÉDIA', body: 'Nouvel article publié', url: '/' };
  try {
    data = { ...data, ...event.data.json() };
  } catch (e) { /* payload texte ou vide */ }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'samou-article',
      vibrate: [100, 50, 100],
      data: { url: data.url }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
