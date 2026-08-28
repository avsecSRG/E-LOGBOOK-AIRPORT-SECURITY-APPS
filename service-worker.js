const CACHE_NAME = 'elogbook-airport-security-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',

  './assets/app-icon.png',
  './assets/home-hp.png',
  './assets/home-tablet.png',
  './assets/home-monitor.png'
];


self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(APP_SHELL);

      })

      .then(() => {

        return self.skipWaiting();

      })

  );

});


self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames
            .filter(name => name !== CACHE_NAME)

            .map(name => {

              return caches.delete(name);

            })

        );

      })

      .then(() => {

        return self.clients.claim();

      })

  );

});


self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') {
    return;
  }


  event.respondWith(

    caches.match(event.request)

      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }


        return fetch(event.request)

          .then(networkResponse => {

            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === 'opaque'
            ) {

              return networkResponse;

            }


            const responseClone =
              networkResponse.clone();


            caches.open(CACHE_NAME)

              .then(cache => {

                cache.put(
                  event.request,
                  responseClone
                );

              });


            return networkResponse;

          })

          .catch(() => {

            return caches.match(
              './index.html'
            );

          });

      })

  );

});
