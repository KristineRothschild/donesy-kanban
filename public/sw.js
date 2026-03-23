const CACHE_NAME = "donesy-static-v2";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/controllers/appController.mjs",
  "/components/userCreate.mjs",
  "/components/userEdit.mjs",
  "/components/userDelete.mjs",
  "/services/apiClient.mjs",
  "/services/router.mjs",
  "/services/i18n.mjs",
  "/models/userModel.mjs",
  "/templates/userCreate.html",
  "/templates/userEdit.html",
  "/templates/userDelete.html",
  "/i18n/en.json",
  "/i18n/nb.json",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (
    isSameOrigin &&
    (url.pathname.startsWith("/users") ||
      url.pathname.startsWith("/boards") ||
      url.pathname.startsWith("/tasks"))
  ) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
