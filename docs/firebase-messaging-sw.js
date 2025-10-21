/* firebase-messaging-sw.js */
/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

// Init Firebase ของโปรเจกต์คุณหนูกบ
firebase.initializeApp({
  apiKey: "AIzaSyBEYRc3lWgrhf3JuzBVOI33sdelL53xuuk",
  authDomain: "onerev-dev.firebaseapp.com",
  projectId: "onerev-dev",
  messagingSenderId: "782528078431",
  appId: "1:782528078431:web:ccd3e92370c8e316c531ea",
});

const messaging = firebase.messaging();

// คำนวณ BASE จาก scope (สำคัญมากบน GitHub Pages)
const BASE = self.registration.scope; // เช่น https://kobkanin.github.io/rails-poc-twa/
const iconUrl = new URL("icon-192.png", BASE).toString();

// รับ background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "Message", {
    body,
    icon: iconUrl,
    badge: iconUrl,
  });
});
