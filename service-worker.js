const CACHE = 'shablon-ua-v1';
const ASSETS = [
  '/notion-templates/',
  '/notion-templates/manifest.webmanifest',
  '/notion-templates/icons/icon-192.png',
  '/notion-templates/icons/icon-512.png',
  '/notion-templates/icons/apple-touch-icon.png',
];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
);

self.addEventListener('activate', e =>
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
);

self.addEventListener('fetch', e => {
  const isHTML = e.request.destination === 'document';
  e.respondWith(
    isHTML
      ? fetch(e.request).catch(() => caches.match(e.request))
      : caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
