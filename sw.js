// ============================================================
//  STACK PICK — SERVICE WORKER
//  Phase 6 — Updated for Stacked Loadout Wall
//
//  Strategy:
//    Core shell (CSS, JS, data, fonts) → Cache-first
//    Pages (HTML)                      → Network-first, fallback cache
//    Images                            → Cache-first, lazy populated
//    External (Amazon, GA, fonts CDN)  → Network-only, never cached
//    Offline                           → /offline.html fallback
//
//  VERSION: bump sp-v4 whenever SHELL_ASSETS change.
// ============================================================

const VERSION     = 'sp-v5';
const SHELL_CACHE = `${VERSION}-shell`;
const PAGE_CACHE  = `${VERSION}-pages`;
const IMAGE_CACHE = `${VERSION}-images`;

// ── Assets cached immediately on install (app shell) ──────────
const SHELL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',

  // ── Phase 6 wall assets ──
  '/assets/css/wall-tokens.css',
  '/assets/css/wall.css',
  '/assets/js/wall.js',
  '/assets/js/data/products.js',
  '/assets/js/data/collections.js',
  '/assets/js/analytics.js',

  // ── Category page shell (style.css + app.js used on all non-wall pages) ──
  '/assets/css/style.css',
  '/assets/js/app.js',

  // ── Category pages (affiliate plumbing — never remove) ──
  '/headsets/',
  '/keyboards/',
  '/mice/',
  '/monitors/',
  '/chairs/',

  // ── Supporting pages ──
  '/guides/',
  '/comparisons/',
  '/search/',
  '/about/',
];

// ── Domains we never intercept (pass straight to network) ──────
const PASSTHROUGH_ORIGINS = [
  'amzn.to',
  'amazon.co.uk',
  'www.googletagmanager.com',
  'www.google-analytics.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

const MAX_PAGES  = 30;
const MAX_IMAGES = 60;


// ============================================================
//  INSTALL — pre-cache the shell
// ============================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Install failed:', err))
  );
});


// ============================================================
//  ACTIVATE — delete stale caches (old sp-v* versions)
// ============================================================
self.addEventListener('activate', event => {
  const KEEP = [SHELL_CACHE, PAGE_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !KEEP.includes(key))
          .map(key => {
            console.log('[SW] Deleting stale cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
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

  // 2. Pass through external origins (Amazon, GA, Google Fonts, etc.)
  if (PASSTHROUGH_ORIGINS.some(origin => url.hostname.includes(origin))) return;

  // 3. Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // 4. Route by type
  if (isImage(url)) {
    event.respondWith(cacheFirstImage(request));
    return;
  }
  if (isPage(request)) {
    event.respondWith(networkFirstPage(request));
    return;
  }

  // Shell assets (CSS, JS, data files) — cache-first
  event.respondWith(cacheFirstShell(request));
});


// ============================================================
//  STRATEGIES
// ============================================================

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
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

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
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match('/offline.html');
    return offline || new Response('<h1>You are offline</h1>', { headers: { 'Content-Type': 'text/html' } });
  }
}

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
  if (request.mode === 'navigate') return true;
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/html');
}

function isImage(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/.test(url.pathname);
}

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
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => { event.source?.postMessage({ type: 'CACHE_CLEARED' }); });
  }
});
