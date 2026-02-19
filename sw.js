// ============================================================
//  STACK PICK — SERVICE WORKER
//  Strategy:
//    - Core shell (CSS, JS, fonts)  → Cache-first
//    - Pages (HTML)                 → Network-first, fallback cache
//    - Images                       → Cache-first, lazy populated
//    - External (Amazon, GA)        → Network-only, never cached
//    - Offline                      → /offline.html fallback
// ============================================================

const VERSION      = 'sp-v2';
const SHELL_CACHE  = `${VERSION}-shell`;
const PAGE_CACHE   = `${VERSION}-pages`;
const IMAGE_CACHE  = `${VERSION}-images`;

// ── Assets cached immediately on install (app shell) ──────
const SHELL_ASSETS = [
  '/',
  '/offline.html',
  '/assets/css/style.css',
  '/assets/js/app.js',
  '/manifest.json',
  '/headsets/',
  '/keyboards/',
  '/mice/',
  '/monitors/',
  '/chairs/',
];

// ── Domains we never intercept ────────────────────────────
const PASSTHROUGH_ORIGINS = [
  'amzn.to',
  'amazon.co.uk',
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// ── Max entries per cache ──────────────────────────────────
const MAX_PAGES  = 30;
const MAX_IMAGES = 60;


// ============================================================
//  INSTALL — pre-cache the shell
// ============================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())   // activate immediately
      .catch(err => console.error('[SW] Install failed:', err))
  );
});


// ============================================================
//  ACTIVATE — delete old caches
// ============================================================
self.addEventListener('activate', event => {
  const KEEP = [SHELL_CACHE, PAGE_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !KEEP.includes(key))
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())  // take control of all open tabs
  );
});


// ============================================================
//  FETCH — route every request
// ============================================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET
  if (request.method !== 'GET') return;

  // 2. Pass through external origins (Amazon, GA, fonts etc.)
  if (PASSTHROUGH_ORIGINS.some(origin => url.hostname.includes(origin))) return;

  // 3. Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // 4. Route by resource type
  if (isImage(url)) {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  if (isPage(request)) {
    event.respondWith(networkFirstPage(request));
    return;
  }

  // Shell assets (CSS, JS, manifest) — cache-first
  event.respondWith(cacheFirstShell(request));
});


// ============================================================
//  STRATEGIES
// ============================================================

// Cache-first for shell assets (CSS/JS never change without VERSION bump)
async function cacheFirstShell(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Shell miss + offline — nothing useful to return
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first for HTML pages — fresh content when online, cached when not
async function networkFirstPage(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
      await trimCache(PAGE_CACHE, MAX_PAGES);
    }

    return response;
  } catch {
    // Network failed — try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // Nothing cached — serve offline page
    const offline = await caches.match('/offline.html');
    return offline || new Response('<h1>You are offline</h1>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Cache-first for images — save bandwidth on repeat visits
async function cacheFirstImage(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
      await trimCache(IMAGE_CACHE, MAX_IMAGES);
    }
    return response;
  } catch {
    // Return a transparent 1px gif as placeholder
    return new Response(
      atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
      { headers: { 'Content-Type': 'image/gif' } }
    );
  }
}


// ============================================================
//  HELPERS
// ============================================================

function isPage(request) {
  // Navigation requests (clicking links, typing URLs)
  if (request.mode === 'navigate') return true;
  // Accept header includes HTML
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/html');
}

function isImage(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/.test(url.pathname);
}

// Trim a cache to maxEntries (FIFO — delete oldest first)
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}


// ============================================================
//  MESSAGE — allow pages to trigger SW actions
// ============================================================
self.addEventListener('message', event => {
  if (!event.data) return;

  // Force the SW to take control immediately (used after updates)
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Clear all caches on demand (useful for a "clear cache" UI button)
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => {
      event.source?.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
});
