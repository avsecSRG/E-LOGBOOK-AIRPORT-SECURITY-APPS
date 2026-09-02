const CACHE_NAME = 'elogbook-airport-security-v4';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/app-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // HTML / halaman utama:
  // selalu mengambil versi terbaru dari GitHub Pages.
  if (
    request.mode === 'navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/E-LOGBOOK-AIRPORT-SECURITY-APPS/')
  ) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put('./index.html', clone);
              });
          }

          return response;
        })
        .catch(() => {
          return caches.match('./index.html');
        })
    );

    return;
  }

  // Asset lainnya:
  // gunakan cache terlebih dahulu agar loading cepat.
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;
        }

        return fetch(request)
          .then(response => {
            if (
              response &&
              response.ok &&
              response.type === 'basic'
            ) {
              const clone = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, clone);
                });
            }

            return response;
          });
      })
  );
});
