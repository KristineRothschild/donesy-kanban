const CACHE_NAME = "donesy-v1";

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
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/users") || url.pathname.startsWith("/boards")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
