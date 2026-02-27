// ============================================================
//  STACKPICK — sw.js
//  Service Worker — cache-first for shell assets,
//  network-first for HTML pages.
//
//  ⚠️  PLACEHOLDER NOTICE:
//  CACHE_NAME must contain '__SP_VERSION__' before each build.
//  build.js Step 8 replaces '__SP_VERSION__' with a real timestamp.
//  build.js Step 9 restores '__SP_VERSION__' after the build.
//  If you see a hardcoded value in CACHE_NAME in git history,
//  Step 9 failed — restore this line manually before committing.
//
//  SHELL_ASSETS: If you add a new static file to the site, add
//  its path here so it is precached during install.
//
//  REMOVED in v4.0 (redesign):
//    /assets/css/wall.css         — deleted
//    /assets/js/theme.js          — deleted (logic now in Base.astro)
//    /assets/js/app.js            — deleted (Astro replaced)
//    /assets/js/wall.js           — deleted (Astro replaced)
//    /assets/js/shared.js         — deleted (Astro replaced)
//    /assets/js/data/products.js  — deleted (data embedded at build time)
//    /assets/js/data/collections.js — deleted (data embedded at build time)
//    /assets/js/data/search-index.js — deleted (data embedded at build time)
//
//  ADDED in v4.0:
//    /assets/css/components.css   — new component library
// ============================================================

var CACHE_NAME = '__SP_VERSION__';

// Shell assets — precached on install.
// These are the files the site cannot function without offline.
var SHELL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/assets/css/tokens.css',
  '/assets/css/components.css',
  '/assets/css/style.css',
  '/assets/js/analytics.js',
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
  // _headers sets Cache-Control: no-store on HTML responses.
  // We attempt to store in SW cache but only if the response is cacheable.

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
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
