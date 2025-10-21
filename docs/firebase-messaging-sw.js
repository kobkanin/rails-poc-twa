/* public/firebase-messaging-sw.js */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

// ใส่ config ของโปรเจกต์ Firebase คุณหนูกบ
firebase.initializeApp({
  apiKey: "AIzaSyBEYRc3lWgrhf3JuzBVOI33sdelL53xuuk",
  authDomain: "onerev-dev.firebaseapp.com",
  projectId: "onerev-dev",
  messagingSenderId: "782528078431",
  appId: "1:782528078431:web:ccd3e92370c8e316c531ea",
});

const messaging = firebase.messaging();

/**
 * รับข้อความตอนอยู่เบื้องหลัง (แอปปิด/พื้นหลัง)
 * ถ้า server ส่ง payload ที่มี notification.title/body จะถูกแสดงอัตโนมัติบน Android ส่วนใหญ่
 * แต่เพื่อความชัวร์ เรา handle เองด้วย:
 */
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: "/icon-192.png",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

// จัดการเมื่อผู้ใช้กดแจ้งเตือน
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.click_action || "/";
  event.waitUntil(clients.openWindow(url));
});
