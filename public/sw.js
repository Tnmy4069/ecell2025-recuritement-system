/**
 * Stub service worker — self-unregisters any previously cached service worker.
 *
 * This file exists only to silence the "GET /sw.js 404" log entries that appear
 * when a browser retains a stale service-worker registration from a previous
 * session. This project does not use PWA / service workers intentionally.
 *
 * On load, this worker immediately unregisters itself so the browser stops
 * trying to fetch it on future visits.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', async () => {
  // Unregister this service worker so the browser stops requesting sw.js.
  await self.registration.unregister();
  // Take control of all pages so the unregistration happens immediately.
  await self.clients.claim();
});
