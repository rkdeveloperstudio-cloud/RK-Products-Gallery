const CACHE_VERSION = "rk-products-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./Add.html",
    "./List.html",
    "./Search.html",

    "./Style.css",
    "./Add.css",
    "./List.css",
    "./Search.css",

    "./App.js",
    "./Add.js",
    "./List.js",
    "./Search.js",
    "./Supabase.js",

    "./manifest.webmanifest"
];

self.addEventListener("install", event => {

    console.log("[SW] Installing:", CACHE_VERSION);

    event.waitUntil(
        caches
            .open(CACHE_VERSION)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});


self.addEventListener("activate", event => {

    console.log("[SW] Activating:", CACHE_VERSION);

    event.waitUntil(
        caches
            .keys()
            .then(keys =>
                Promise.all(
                    keys
                        .filter(key => key !== CACHE_VERSION)
                        .map(key => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});


self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    // HTML pages:
    // Always check the server first.
    // This is important for automatic updates.
    if (
        request.mode === "navigate" ||
        request.destination === "document"
    ) {

        event.respondWith(
            fetch(request)
                .then(response => {

                    const copy = response.clone();

                    caches
                        .open(CACHE_VERSION)
                        .then(cache => {
                            cache.put(request, copy);
                        });

                    return response;
                })
                .catch(() =>
                    caches.match(request)
                )
        );

        return;
    }


    // CSS / JS / manifest / other static files:
    // Try network first so new versions are obtained.
    event.respondWith(
        fetch(request)
            .then(response => {

                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {

                    const copy = response.clone();

                    caches
                        .open(CACHE_VERSION)
                        .then(cache => {
                            cache.put(request, copy);
                        });
                }

                return response;
            })
            .catch(() =>
                caches.match(request)
            )
    );
});