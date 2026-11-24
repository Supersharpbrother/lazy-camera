const CACHE = "lazy-camera-v4";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./mira.svg",
  "./mira.pdf",
  "./cameras.js",
  "./cam.js",
  "./lenses.js",
  "./coverage.js",
  "./optics.js",
  "./fonts/IBMPlexMono-Regular.woff",
  "./fonts/IBMPlexMono-SemiBold.woff",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isCacheFirst(url) {
  const path = url.pathname;
  return (
    path.endsWith(".woff") ||
    path.endsWith(".woff2") ||
    path.endsWith(".ttf") ||
    path.endsWith(".otf") ||
    path.endsWith(".png") ||
    path.endsWith(".ico") ||
    path.endsWith(".jpg") ||
    path.endsWith(".jpeg") ||
    path.endsWith(".webp")
  );
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.ok && new URL(request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (request.mode === "navigate") {
        return (await caches.match("./index.html")) || (await caches.match("./"));
      }
      throw new Error("offline");
    });
}

function cacheFirst(request) {
  return caches.match(request, { ignoreSearch: true }).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response && response.ok && new URL(request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    });
  });
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const handler = isCacheFirst(url) ? cacheFirst : networkFirst;
  event.respondWith(handler(event.request));
});
