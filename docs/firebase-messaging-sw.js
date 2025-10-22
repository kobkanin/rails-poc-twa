/* /rails-poc-twa/firebase-messaging-sw.js */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

// ✅ ใช้ Web config (appId ลงท้าย :web:)
firebase.initializeApp({
  apiKey: "AIzaSyBEYRc3lWgrhf3JuzBVOI33sdelL53xuuk",
  authDomain: "onerev-dev.firebaseapp.com",
  projectId: "onerev-dev",
  messagingSenderId: "782528078431",
  appId: "1:782528078431:web:ccd3e92370c8e316c531ea",
});

const messaging = firebase.messaging();

// ให้ path ไอคอนถูกกับ GitHub Pages
const BASE = self.registration.scope; // ex: https://kobkanin.github.io/rails-poc-twa/
const iconUrl = new URL("icon-192.png", BASE).toString();

// ✅ โหมดไม่ซ้ำ: รับ "data-only" แล้วค่อยแสดงเอง
messaging.onBackgroundMessage(({ data }) => {
  const title = data?.title || "Notification";
  const body = data?.body || "";
  const url = data?.url || BASE;

  self.registration.showNotification(title, {
    body,
    icon: iconUrl,
    data: { url },
  });
});

// จัดการคลิก → โฟกัสแท็บเดิม ถ้าไม่มีให้เปิดใหม่ในสโคปเดียวกัน
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification?.data?.url || BASE;
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        const page = list.find((w) => w.url.startsWith(target));
        if (page && "focus" in page) return page.focus();
        return clients.openWindow(target);
      })
  );
});

// ให้ SW ใหม่ takeover ทันที
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
