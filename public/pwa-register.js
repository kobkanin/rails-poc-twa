// Register SW at the ROOT scope
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      });
      // Optional: update when a new SW is found
      if (reg && reg.update) {
        setInterval(() => reg.update(), 60 * 60 * 1000); // เช็คทุกชั่วโมง
      }
      console.log("[PWA] SW registered", reg);
    } catch (e) {
      console.warn("[PWA] SW registration failed", e);
    }
  });
}
