/* firebase-messaging-sw.js */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

/** 1) Init Firebase ของโปรเจกต์ */
firebase.initializeApp({
  apiKey: "AIzaSyBEYRc3lWgrhf3JuzBVOI33sdelL53xuuk",
  authDomain: "onerev-dev.firebaseapp.com",
  projectId: "onerev-dev",
  messagingSenderId: "782528078431",
  appId: "1:782528078431:web:ccd3e92370c8e316c531ea",
});

const messaging = firebase.messaging();

/** 2) คำนวณ base URL ตาม scope ของ SW (รองรับ GitHub Pages /rails-poc-twa/) */
const BASE = self.registration.scope; // e.g. https://kobkanin.github.io/rails-poc-twa/
const toUrl = (p) => new URL(p, BASE).toString();
const ICON_URL = toUrl("icon-192.png");
const HOME_URL = toUrl("./");

/** 3) รับข้อความตอนเบื้องหลัง (background) */
messaging.onBackgroundMessage((payload) => {
  // รองรับทั้งกรณีส่ง notification-object และ data-only (title/body อยู่ใน data)
  const n = payload.notification || {};
  const d = payload.data || {};

  const title = n.title || d.title || "Notification";
  const body = n.body || d.body || "";

  const clickAction = d.click_action || n.click_action || HOME_URL;

  const options = {
    body,
    icon: ICON_URL,
    data: {
      ...d,
      click_action: clickAction,
    },
  };

  self.registration.showNotification(title, options);
});

/** 4) เปิดหน้า/โฟกัสแท็บเมื่อผู้ใช้คลิกแจ้งเตือน */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.click_action || HOME_URL;

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        // ใช้ startsWith เพื่อครอบกรณีมี query/hash
        if (client.url.startsWith(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })()
  );
});

/** 5) ให้ SW เวอร์ชันใหม่ takeover ไว */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
