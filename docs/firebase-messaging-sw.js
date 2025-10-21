/* firebase-messaging-sw.js */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

// === 1) Init Firebase ของโปรเจกต์กบ ===
firebase.initializeApp({
  apiKey: "AIzaSyBEYRc3lWgrhf3JuzBVOI33sdelL53xuuk",
  authDomain: "onerev-dev.firebaseapp.com",
  projectId: "onerev-dev",
  messagingSenderId: "782528078431",
  appId: "1:782528078431:web:ccd3e92370c8e316c531ea",
});

const messaging = firebase.messaging();

// คำนวณ base URL ตาม scope ของ SW (เพื่อให้พาธถูกบน GitHub Pages)
const BASE = self.registration.scope; // ex: https://kobkanin.github.io/rails-poc-twa/
const iconUrl = new URL("icon-192.png", BASE).toString();

// === 2) รับข้อความตอนเบื้องหลัง ===
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: iconUrl, // ใช้ไอคอนตาม scope
    data: {
      // เก็บข้อมูลไว้ใช้ตอนคลิก
      ...payload.data,
      // รองรับกรณี server ส่ง click_action หรือถ้าไม่ส่งให้ fallback ไป index ของโปรเจกต์
      click_action: payload.data?.click_action || new URL("", BASE).toString(),
    },
  };
  self.registration.showNotification(title, options);
});

// === 3) เปิดหน้า/โฟกัสแท็บเมื่อผู้ใช้คลิกแจ้งเตือน ===
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    event.notification?.data?.click_action || new URL("", BASE).toString();

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // ถ้ามีแท็บที่เปิด URL เดิมแล้ว ให้โฟกัสแท็บนั้น
      for (const client of allClients) {
        if (client.url.startsWith(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // ไม่มีก็เปิดใหม่
      return clients.openWindow(targetUrl);
    })()
  );
});

// (ออปชัน) ช่วยให้ SW เวอร์ชันใหม่ takeover ได้ไวขึ้นเวลาอัปเดต
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
