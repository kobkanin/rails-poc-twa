/* sw.js */
const VERSION = "v1.0.0";
const BASE = self.registration.scope; // ex: https://kobkanin.github.io/rails-poc-twa/
const STATIC_CACHE = `static-${VERSION}`;
const OFFLINE_URL = new URL("offline.html", BASE).toString();

// ปรับรายการไฟล์ที่อยากพรีแคชได้
const PRECACHE = [
  new URL("index.html", BASE).toString(),
  new URL("manifest.json", BASE).toString(),
  new URL("icon-192.png", BASE).toString(),
  new URL("icon-512.png", BASE).toString(),
  OFFLINE_URL,
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// ช่วยจำแนกชนิดไฟล์
const isHTML = (req) =>
  req.mode === "navigate" ||
  (req.headers.get("accept") || "").includes("text/html");

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // อย่าจับคู่ FCM SW
  const url = new URL(request.url);
  if (url.pathname.endsWith("/firebase-messaging-sw.js")) return;

  if (isHTML(request)) {
    // Network-first สำหรับ HTML
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL));
        }
      })()
    );
  } else {
    // Stale-while-revalidate สำหรับ asset อื่นๆ
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await caches.match(request);
        const fetchPromise = fetch(request)
          .then((resp) => {
            cache.put(request, resp.clone());
            return resp;
          })
          .catch(() => null);
        return cached || fetchPromise || fetch(request);
      })()
    );
  }
});
