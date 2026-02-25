// ============================================================
//  STACKPICK V2 — sw.js
//  Service Worker — Force Marry edition.
//  Cache-first for shell assets, network-first for pages/data.
// ============================================================

var CACHE_NAME = 'sp-v2-shell-v1';

// Shell assets — precached on install.
// All files the site needs to render offline.
var SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/tokens.css',
  '/assets/css/wall.css',
  '/assets/css/style.css',
  '/assets/js/theme.js',
  '/assets/js/app.js',
  '/assets/js/wall.js',
  '/assets/js/analytics.js',
  '/assets/js/data.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
];

// ── Install ──
// FIX (from v1): self.skipWaiting() must be outside caches.open().
// If cache.open() rejects (quota exceeded), the SW would get stuck
// in waiting state. skipWaiting fires unconditionally now.
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting(); // unconditional — do not nest inside caches.open()
});

// ── Activate ──
// Remove old caches. Takes control of all clients immediately.
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// ── Fetch ──
// Strategy:
//   Shell assets (css, js, fonts, icons) → cache-first
//   HTML pages                           → network-first, cache fallback
//   API / affiliate links                → network only (never cache)
//   Everything else                      → network-first, cache fallback

self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // Never intercept affiliate / external requests
  if (url.includes('amzn.to') ||
      url.includes('amazon.co.uk') ||
      url.includes('google-analytics') ||
      url.includes('googletagmanager') ||
      url.includes('fonts.googleapis.com')) {
    return;
  }

  // Cache-first for static assets
  if (isShellAsset(url)) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return cached || fetch(event.request).then(function (response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for HTML pages
  if (event.request.mode === 'navigate' ||
      event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Network-first fallback for everything else
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});

function isShellAsset(url) {
  return url.includes('/assets/css/') ||
         url.includes('/assets/js/') ||
         url.includes('/assets/icons/') ||
         url.includes('/assets/images/') ||
         url.endsWith('manifest.json');
}
