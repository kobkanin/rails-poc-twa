/* firebase-messaging-sw.js */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

// 🔧 Firebase config ของคุณหนูกบ
firebase.initializeApp({
  apiKey: "AIzaSyBEYRc3lWgrhf3JuzBVOI33sdelL53xuuk",
  authDomain: "onerev-dev.firebaseapp.com",
  projectId: "onerev-dev",
  messagingSenderId: "782528078431",
  appId: "1:782528078431:web:ccd3e92370c8e316c531ea",
});

const messaging = firebase.messaging();

// base URL สำหรับ GitHub Pages (ใช้ self.registration.scope)
const BASE = self.registration.scope;
const iconUrl = new URL("icon-192.png", BASE).toString();

// รับข้อความเบื้องหลัง
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message", payload);
  const title = payload.notification?.title || "Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: iconUrl,
    data: {
      ...payload.data,
      click_action: payload.data?.click_action || BASE,
    },
  };
  self.registration.showNotification(title, options);
});

// เมื่อผู้ใช้คลิกแจ้งเตือน
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.click_action || BASE;
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if (client.url.startsWith(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});

// ให้ SW ตัวใหม่ takeover ทันที
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
