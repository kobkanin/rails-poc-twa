const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/", // หน้า root
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  // เพิ่มไฟล์ static ที่อยาก cache เช่น CSS/JS จาก asset pipeline (ใส่ path ที่ build แล้ว)
];

// ติดตั้ง: cache ไฟล์คงที่
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// เปิดใช้งาน: ลบ cache เก่า
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// กลยุทธ์แยกตามชนิดคำขอ
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) หน้า HTML -> Network First (ออนไลน์สด, ล้มเหลวค่อยใช้ cache)
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  // 2) ไฟล์ static (css/js/img) -> Stale-While-Revalidate
  if (["style", "script", "image", "font"].includes(req.destination)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // 3) API ของเรา -> Network First (อยากได้ข้อมูลใหม่)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // ค่าเริ่มต้น
  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    return cached || caches.match("/"); // fallback ไปหน้า root
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((res) => {
      cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || networkPromise;
}
