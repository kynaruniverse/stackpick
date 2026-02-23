// ============================================================
//  STACK PICK — SERVICE WORKER
//  Phase 7 — Improved caching, diagnostics, and offline UX
//
//  Strategy:
//    Core shell (CSS, JS, data, fonts) → Stale-while-revalidate
//    Pages (HTML)                      → Network-first, fallback cache
//    Images                            → Cache-first, lazy populated
//    External (Amazon, GA, fonts CDN)  → Network-only, never cached
//    Offline                           → /offline.html fallback
//
//  VERSION: Auto-injected by _generator/build.js at build time.
//  Do not edit VERSION manually — it will be overwritten on next build.
// ============================================================

// ── VERSION — injected by build.js (format: sp-YYYYMMDD-HHMMSS) ──
// If you see 'sp-dev' the build step did not run — do not deploy.
const VERSION     = typeof __SP_VERSION__ !== 'undefined' ? __SP_VERSION__ : 'sp-dev';
const SHELL_CACHE = `${VERSION}-shell`;
const PAGE_CACHE  = `${VERSION}-pages`;
const IMAGE_CACHE = `${VERSION}-images`;

// ── Assets cached immediately on install (app shell) ──────────
const SHELL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',

  // ── Wall assets ──
  '/assets/css/wall-tokens.css',
  '/assets/css/wall.css',
  '/assets/js/wall.js',
  '/assets/js/data/products.js',
  '/assets/js/data/collections.js',
  '/assets/js/analytics.js',

  // ── Category page shell (used on all non-wall pages) ──
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

const MAX_SHELL  = 60;   // shell cache cap (was unlimited — now bounded)
const MAX_PAGES  = 30;
const MAX_IMAGES = 60;

// ── Offline image placeholder (SVG — visible and branded) ──────
// Replaces the old 1×1 transparent GIF with a proper grey placeholder
const OFFLINE_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <rect x="150" y="100" width="100" height="100" rx="8" fill="#2a2a3e"/>
  <text x="200" y="155" font-family="system-ui,sans-serif" font-size="32" text-anchor="middle" fill="#444466">⚡</text>
  <text x="200" y="220" font-family="system-ui,sans-serif" font-size="12" text-anchor="middle" fill="#555577">Image unavailable offline</text>
</svg>`;


// ============================================================
//  INSTALL — pre-cache the shell with per-asset error reporting
// ============================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async cache => {

      // Cache each asset individually so a single 404 doesn't
      // silently kill the entire install and leave us guessing.
      const results = await Promise.allSettled(
        SHELL_ASSETS.map(asset =>
          fetch(asset).then(response => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status} for ${asset}`);
            }
            return cache.put(asset, response);
          })
        )
      );

      const failures = results
        .map((r, i) => r.status === 'rejected' ? { asset: SHELL_ASSETS[i], reason: r.reason?.message } : null)
        .filter(Boolean);

      if (failures.length > 0) {
        console.warn('[SW] Install completed with asset failures:');
        failures.forEach(f => console.warn(`  ✗ ${f.asset} — ${f.reason}`));
        // Still activate — partial shell is better than no SW at all.
        // Critical assets (wall.css, wall.js) failing here means the
        // site won't work offline, but online users are unaffected.
      } else {
        console.log(`[SW] Install complete — ${SHELL_ASSETS.length} assets cached (${VERSION})`);
      }

      await self.skipWaiting();
    })
  );
});


// ============================================================
//  ACTIVATE — delete stale caches (old sp-* versions)
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
      .then(() => console.log(`[SW] Active — version ${VERSION}`))
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
  if (PASSTHROUGH_ORIGINS.some(origin =>
    url.hostname === origin || url.hostname.endsWith('.' + origin)
  )) return;

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

  // Shell assets (CSS, JS, data files) — stale-while-revalidate
  // Serves from cache instantly, then updates the cache in the background.
  // This replaces the old cache-first which would serve stale assets
  // indefinitely if VERSION wasn't bumped.
  event.respondWith(staleWhileRevalidateShell(request));
});


// ============================================================
//  STRATEGIES
// ============================================================

// Stale-while-revalidate for shell assets (CSS, JS, data files).
// Returns cached version immediately (fast), then fetches a fresh
// copy in the background and updates the cache for next time.
// If nothing is cached yet, falls back to a straight network fetch.
async function staleWhileRevalidateShell(request) {
  const cache  = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);

  // Fire a background revalidation regardless of whether we have a cache hit
  const revalidatePromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(SHELL_CACHE, MAX_SHELL);
    }
    return response;
  }).catch(() => null); // background fetch failing is fine — we have the cache

  if (cached) return cached;

  // No cache hit — wait for the network response
  try {
    const response = await revalidatePromise;
    if (response) return response;
  } catch { /* fall through */ }

  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}

// Network-first for HTML pages.
// Always tries the network first for fresh content.
// Falls back to cache, then /offline.html if both fail.
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

// Cache-first for images.
// Serves from cache if available, otherwise fetches and caches.
// Returns a branded SVG placeholder if both fail (replaces old 1×1 GIF).
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
    return new Response(OFFLINE_IMAGE_SVG, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
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

// Evicts oldest entries when a cache exceeds maxEntries.
// Oldest = first inserted (insertion order is preserved by the Cache API).
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

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => { event.source?.postMessage({ type: 'CACHE_CLEARED' }); });
  }

  // Returns current version and cache names to the requesting page.
  // Useful for debugging — call from DevTools console:
  //   navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' })
  //   navigator.serviceWorker.addEventListener('message', e => console.log(e.data))
  if (event.data.type === 'GET_VERSION') {
    event.source?.postMessage({
      type:    'VERSION_INFO',
      version: VERSION,
      caches:  { shell: SHELL_CACHE, pages: PAGE_CACHE, images: IMAGE_CACHE },
    });
  }
});
