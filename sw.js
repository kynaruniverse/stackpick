// ============================================================
//  STACKPICK V2 — sw.js
//  Service Worker — Force Marry edition.
//  Cache-first for shell assets, network-first for pages/data.
//
//  ⚠️  PLACEHOLDER NOTICE:
//  CACHE_NAME must contain '__SP_VERSION__' before each build.
//  build.js Step 8 replaces '__SP_VERSION__' with a real timestamp.
//  build.js Step 9 restores '__SP_VERSION__' after the build.
//  If you see a hardcoded value in CACHE_NAME in git history,
//  Step 9 failed — restore this line manually before committing.
//
//  SHELL_ASSETS: If you add a new static file to the site, add
//  its path here so it's precached during install.
// ============================================================

var CACHE_NAME = '__SP_VERSION__';

// Shell assets — precached on install.
var SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/css/tokens.css',
  '/assets/css/components.css',
  '/assets/css/wall.css',
  '/assets/css/style.css',
  '/assets/js/theme.js',
  '/assets/js/shared.js',
  '/assets/js/app.js',
  '/assets/js/wall.js',
  '/assets/js/analytics.js',
  '/assets/js/data/products.js',
  '/assets/js/data/collections.js',
  '/assets/js/data/search-index.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
];

// ── Install ──────────────────────────────────────────────────────────────────
// skipWaiting() is unconditional — must NOT be nested inside caches.open()
// or it silently fails to skip if the cache operation rejects.

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting(); // unconditional
});


// ── Activate ─────────────────────────────────────────────────────────────────
// Remove all caches whose key doesn't match the current CACHE_NAME.
// Takes control of all open clients immediately.

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


// ── Fetch ────────────────────────────────────────────────────────────────────
// Strategy by resource type:
//   Shell assets (css, js, fonts, icons)  → cache-first
//   HTML pages                             → network-first, cache fallback
//   External / affiliate links             → network only (pass-through)

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  // Never intercept external (affiliate) requests
  if (url.hostname !== self.location.hostname) return;

  var reqPath = url.pathname;

  // ── Cache-first: shell assets ───────────────────────────────────────────
  if (
    reqPath.startsWith('/assets/') ||
    reqPath === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request).then(function (response) {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          return caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // ── Network-first: HTML pages ───────────────────────────────────────────
  // Note: _headers sets Cache-Control: no-store on HTML responses.
  // We attempt to store in SW cache but only if the response is cacheable.
  // Browsers may decline to cache no-store responses — this is correct behaviour.

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Only attempt to cache OK responses — skip error/redirect/opaque
        if (response && response.status === 200 && response.type === 'basic') {
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match('/offline.html');
        });
      })
  );
});
