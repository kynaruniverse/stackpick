// ============================================================
//  STACKPICK V2 — sw.js
//  Service Worker — Force Marry edition.
//  Cache-first for shell assets, network-first for pages/data.
//
//  BUG FIXES vs previous version:
//
//  1. CACHE_NAME placeholder
//     Previous: var CACHE_NAME = 'sp-v2-shell-v1';
//     The build tried to match `"sp-\d{14}"` or `__SP_VERSION__`
//     but the value was neither — CACHE_NAME was NEVER updated between
//     builds, so stale assets could be served indefinitely.
//     Fix: CACHE_NAME is now "sp-20260225185905". build.js Step 8 replaces
//     the entire 'string including quotes' with JSON.stringify(version),
//     yielding e.g. var CACHE_NAME = "sp-20260225143022";
//     Restore this placeholder if you ever hard-edit this file.
//
//  2. Dead SHELL_ASSETS path
//     Previous: '/assets/js/data.js' (file no longer exists)
//     The build now generates three separate data files.
//     Fix: All three real file paths are now listed below.
// ============================================================

var CACHE_NAME = "sp-20260225185905";

// Shell assets — precached on install.
// All files the site needs to render offline.
// ⚠️  If you add a new static asset, add it here too.
var SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/tokens.css',
  '/assets/css/components.css',
  '/assets/css/wall.css',
  '/assets/css/style.css',
  '/assets/js/theme.js',
  '/assets/js/shared.js',
  '/assets/js/app.js',
  '/assets/js/wall.js',
  '/assets/js/analytics.js',
  // BUG FIX: replaced dead '/assets/js/data.js' with the three real generated files
  '/assets/js/data/products.js',
  '/assets/js/data/collections.js',
  '/assets/js/data/search-index.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
];

// ── Install ──
// FIX (from v1): self.skipWaiting() must be outside caches.open().
// If caches.open() rejects (quota exceeded), the SW would get stuck
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
  var url = new URL(event.request.url);

  // Never intercept affiliate / external requests
  if (url.hostname !== self.location.hostname) return;

  var path = url.pathname;

  // ── Cache-first: shell assets ──────────────────────────────────
  if (
    path.startsWith('/assets/') ||
    path.startsWith('/assets/icons/') ||
    path === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return cached || fetch(event.request).then(function (response) {
          return caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // ── Network-first: HTML pages ───────────────────────────────────
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        return caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match('/offline.html');
        });
      })
  );
});
