const CACHE_NAME = 'mi-dinero-v4';
const urlsToCache = [
  '/mi-dinero/',
  '/mi-dinero/index.html',
  '/mi-dinero/css/styles.css',
  '/mi-dinero/js/storage.js',
  '/mi-dinero/js/charts.js',
  '/mi-dinero/js/app.js',
  '/mi-dinero/icons/icon.svg',
  '/mi-dinero/icons/icon-192.png',
  '/mi-dinero/icons/icon-512.png'
];

// Instalación - cachear archivos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Error cacheando archivos:', err);
      })
  );
  self.skipWaiting();
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - estrategia Cache First con Network Fallback
self.addEventListener('fetch', event => {
  // Ignorar requests que no sean GET
  if (event.request.method !== 'GET') return;

  // Ignorar requests a APIs externas (para cotización USD)
  if (event.request.url.includes('dolarapi.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retornar respuesta del cache
        if (response) {
          return response;
        }

        // Clonar el request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Verificar si es una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar la respuesta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Si falla el fetch, intentar retornar algo del cache
          return caches.match('/mi-dinero/index.html');
        });
      })
  );
});
