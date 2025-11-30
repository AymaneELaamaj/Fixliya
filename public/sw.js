// Service Worker principal pour FixLiya
const CACHE_NAME = 'fixliya-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/vite.svg'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache ouvert');
        // Ne pas échouer si certains fichiers ne peuvent pas être mis en cache
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`[Service Worker] Impossible de mettre en cache: ${url}`, err);
            })
          )
        );
      })
      .catch((error) => {
        console.error('[Service Worker] Erreur lors de la mise en cache:', error);
      })
  );
  // Forcer l'activation immédiate
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prendre le contrôle immédiatement
  return self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la version en cache si disponible
        if (response) {
          return response;
        }

        // Sinon, faire la requête réseau
        return fetch(event.request)
          .then((networkResponse) => {
            // Vérifier si c'est une réponse valide
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
              return networkResponse;
            }

            // Cloner la réponse car elle ne peut être consommée qu'une fois
            const responseToCache = networkResponse.clone();

            // Mettre en cache la nouvelle réponse
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Uniquement pour les GET requests
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache).catch(err => {
                    console.warn('[Service Worker] Erreur mise en cache:', err);
                  });
                }
              });

            return networkResponse;
          })
          .catch((error) => {
            console.warn('[Service Worker] Erreur réseau pour:', event.request.url, error);
            
            // Retourner une page offline si disponible
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Pour les autres requêtes, laisser échouer gracieusement
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
