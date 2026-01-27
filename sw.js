const APP_VERSION = '1.0.1';
const CACHE_NAME = 'cgl-planner-v2';

const ASSETS = [
  './index.html',
  './manifest.json',
  './sw.js',
  './image/logo.png',
  './style.css', // add your CSS
  './script.js' // add your JS
];

// Install event: cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // Take control immediately
});

// Fetch: serve from cache if offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

// Listen for message to force update
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
