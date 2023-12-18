
var url = new URL(location.href)

if (url.protocol === 'https:') {
    const registerServiceWorker = async () => {
        if ("serviceWorker" in navigator) {
            try {
                const registration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                });
                if (registration.installing) {
                    console.log("Service worker installing");
                } else if (registration.waiting) {
                    console.log("Service worker installed");
                } else if (registration.active) {
                    console.log("Service worker active");
                }
            } catch (error) {
                console.error(`Registration failed with ${error}`);
            }
        }
    };

// …

    registerServiceWorker();

    const addResourcesToCache = async (resources) => {
        const cache = await caches.open("v1");
        await cache.addAll(resources);
    };

    self.addEventListener("install", (event) => {
        event.waitUntil(
            addResourcesToCache([
                // "/",
                // "/index",
                // "/en/index",
                // "/en/language",
                // "/ua/index",
                // "/ua/language",
                // "style.css",
                // "app.webmanifest",
                // "/favicon.svg",
                // "/language-translator-icon.svg",
                // "/linux-icon.svg",
                // "/mac-os-x-icon.svg",
                // "/shield-checkmark-black-icon.svg",
                // "/shield-lock-black-icon.svg",
                // "/thunder-icon.svg",
                // "/windows-button-icon.svg",
            ])
        );
    });


    const putInCache = async (request, response) => {
        if (request.method === 'GET') {
            const cache = await caches.open("v1");
            await cache.put(request, response);
        }
    };

    const cacheFirst = async ({ request, fallbackUrl }) => {
        // First try to get the resource from the cache
        const responseFromCache = await caches.match(request);
        if (responseFromCache) {
            return responseFromCache;
        }

        // Next try to get the resource from the network
        try {
            const responseFromNetwork = await fetch(request);
            // response may be used only once
            // we need to save clone to put one copy in cache
            // and serve second one
            putInCache(request, responseFromNetwork.clone());
            return responseFromNetwork;
        } catch (error) {
            const fallbackResponse = await caches.match(fallbackUrl);
            if (fallbackResponse) {
                return fallbackResponse;
            }
            // when even the fallback response is not available,
            // there is nothing we can do, but we must always
            // return a Response object
            return new Response("Network error happened", {
                status: 408,
                headers: { "Content-Type": "text/plain" },
            });
        }
    };

    self.addEventListener("fetch", (event) => {
        event.respondWith(
            cacheFirst({
                request: event.request,
                fallbackUrl: "/favicon.svg",
            })
        );
    });


    const deleteCache = async (key) => {
        await caches.delete(key);
    };

    const deleteOldCaches = async () => {
        const cacheKeepList = ["v2"];
        const keyList = await caches.keys();
        const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
        await Promise.all(cachesToDelete.map(deleteCache));
    };

    self.addEventListener("activate", (event) => {
        event.waitUntil(deleteOldCaches());
        event.waitUntil(self.registration?.navigationPreload.enable());

    });


}


