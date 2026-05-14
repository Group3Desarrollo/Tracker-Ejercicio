const CACHE_NAME = 'tracker-cache-v3';

const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// ========================
// INSTALL
// ========================
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
            .catch(err => {
                console.error('[SW] Error en install:', err);
            })
    );
});

// ========================
// ACTIVATE
// ========================
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

// ========================
// FETCH
// ========================
self.addEventListener('fetch', event => {

    const { request } = event;

    // Solo GET
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // IMPORTANTE:
    // NO interceptar Supabase ni APIs externas
    if (
        url.origin !== self.location.origin ||
        url.hostname.includes('supabase.co')
    ) {
        return;
    }

    const isScript = request.destination === 'script';
    const isStyle = request.destination === 'style';
    const isImage = request.destination === 'image';
    const isHTML =
        request.mode === 'navigate' ||
        request.destination === 'document';

    // ========================
    // JS / CSS → Network First
    // ========================
    if (isScript || isStyle) {

        event.respondWith(
            fetch(request)
                .then(response => {

                    if (!response || response.status !== 200) {
                        return response;
                    }

                    const responseClone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(request, responseClone);
                        });

                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(request);
                    return cached;
                })
        );

        return;
    }

    // ========================
    // IMÁGENES → Cache First
    // ========================
    if (isImage) {

        event.respondWith(
            caches.match(request)
                .then(cached => {

                    if (cached) return cached;

                    return fetch(request)
                        .then(response => {

                            if (!response || response.status !== 200) {
                                return response;
                            }

                            const responseClone = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });

                            return response;
                        });

                })
        );

        return;
    }

    // ========================
    // HTML → Stale While Revalidate
    // ========================
    if (isHTML) {

        event.respondWith(

            caches.open(CACHE_NAME).then(async cache => {

                const cached = await cache.match(request);

                const fetchPromise = fetch(request)
                    .then(response => {

                        if (response && response.status === 200) {
                            cache.put(request, response.clone());
                        }

                        return response;
                    })
                    .catch(() => cached);

                return cached || fetchPromise;
            })

        );

        return;
    }

});

// ========================
// NOTIFICATION CLICK
// ========================
self.addEventListener('notificationclick', event => {

    event.notification.close();

    event.waitUntil(

        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(windowClients => {

            for (const client of windowClients) {

                if (client.url.includes(self.location.origin)) {
                    return client.focus();
                }

            }

            return clients.openWindow('./');

        })

    );

});