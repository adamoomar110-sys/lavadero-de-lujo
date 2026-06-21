const CACHE_NAME = 'lavadero-cliente-v3-premium';
const DYNAMIC_CACHE = 'lavadero-dynamic-v3';

// Assets estáticos críticos para PWA (Cache-First)
const staticAssets = [
  './app_cliente.html',
  './style.css',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Orbitron:wght@700;900&family=Outfit:wght@400;600;800&display=swap'
];

// Instalación: Cachear assets estáticos
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(staticAssets);
    })
  );
});

// Activación: Limpiar cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch: Stale-While-Revalidate avanzado
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Evitar interceptar peticiones no GET (como POST a Supabase)
  if (request.method !== 'GET') return;

  // Estrategia para API/Supabase (Stale-While-Revalidate)
  if (url.origin.includes('supabase.co') || url.pathname.includes('/rest/v1/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.match(request).then(response => {
          const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            console.log("Offline: No se pudo actualizar datos de la API");
          });

          // Devolver desde caché si existe, sino esperar la red
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // Estrategia para Assets Estáticos (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        // Solo cachear respuestas válidas
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(err => {
        console.log("Offline: Usando fallback caché estático", err);
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Manejo de eventos Push para notificaciones
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Lavadero de Lujo', body: '¡Tenemos novedades para ti!' };
  
  const options = {
    body: data.body,
    icon: 'logo.png',
    vibrate: [100, 50, 100],
    data: { url: './app_cliente.html' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Al clickear la notificación, abrir la app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
