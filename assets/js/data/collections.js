/* ============================================================
   STACK PICK — collections.js  v6
   8 collections · 3 shuffle variants max per collection
   All product IDs must exist in products.js — validated on load.
   Last updated: February 2026
   ============================================================ */

window.SP_COLLECTIONS = [

  /* ──────────────────────────────────────────────────────────
     1. ALL PICKS — Default collection, every product
     ────────────────────────────────────────────────────────── */
  {
    id:    'all-picks',
    label: 'All Picks',
    emoji: '🏴',
    color: '#F2F0EB',                          /* chalk */
    baseProducts: [
      'mice-razer-viper-v3-pro',
      'keyboards-steelseries-apex-pro-tkl-gen3',
      'headsets-sennheiser-hd560s',
      'monitors-asus-rog-xg27aqdmg',
      'chairs-andaseat-kaiser-4',
      'mice-endgame-gear-op1w',
      'keyboards-asus-rog-strix-scope-ii-96',
      'headsets-hyperx-cloud-iii-s-wireless',
      'monitors-aoc-24g4xe',
      'chairs-corsair-tc100-relaxed',
      'mice-lamzu-thorn-4k',
      'keyboards-aula-f99-wireless',
      'headsets-steelseries-arctis-nova-pro',
      'monitors-aoc-q27g3xmn',
      'chairs-sihoo-doro-c300',
      'mice-logitech-g502x-plus',
      'keyboards-keychron-q1-max',
      'headsets-bose-quietcomfort-ultra-gen2',
      'monitors-msi-mag-274updf',
      'chairs-eureka-typhon',
      'mice-atk-vxe-mad-r',
      'keyboards-keychron-c3-pro',
      'headsets-astro-a10-gen2',
      'monitors-samsung-odyssey-g80sd',
      'chairs-noblechairs-hero',
    ],
    shuffleVariants: [
      {
        label:    'v2 — Fan Favourites',
        products: [
          'mice-razer-viper-v3-pro',
          'keyboards-keychron-q1-max',
          'headsets-hyperx-cloud-iii-s-wireless',
          'monitors-asus-rog-xg27aqdmg',
          'chairs-andaseat-kaiser-4',
          'mice-lamzu-thorn-4k',
          'keyboards-asus-rog-strix-scope-ii-96',
          'headsets-sennheiser-hd560s',
          'monitors-aoc-q27g3xmn',
          'chairs-noblechairs-hero',
        ],
      },
      {
        label:    'v3 — Budget Alts',
        products: [
          'mice-atk-vxe-mad-r',
          'keyboards-keychron-c3-pro',
          'headsets-astro-a10-gen2',
          'monitors-aoc-24g4xe',
          'chairs-corsair-tc100-relaxed',
          'mice-endgame-gear-op1w',
          'keyboards-aula-f99-wireless',
          'headsets-sennheiser-hd560s',
          'monitors-aoc-q27g3xmn',
          'chairs-eureka-typhon',
        ],
      },
    ],
  },


  /* ──────────────────────────────────────────────────────────
     2. SWEATY FPS — Max performance, competitive focus
     ────────────────────────────────────────────────────────── */
  {
    id:    'sweaty-fps',
    label: 'Sweaty FPS',
    emoji: '🎯',
    color: '#FF2D55',                          /* crimson */
    baseProducts: [
      'mice-razer-viper-v3-pro',
      'mice-endgame-gear-op1w',
      'mice-atk-vxe-mad-r',
      'keyboards-steelseries-apex-pro-tkl-gen3',
      'headsets-sennheiser-hd560s',
      'monitors-asus-rog-xg27aqdmg',
      'monitors-aoc-24g4xe',
      'chairs-andaseat-kaiser-4',
    ],
    shuffleVariants: [
      {
        label:    'v2 — Spicy Picks',
        products: [
          'mice-lamzu-thorn-4k',
          'keyboards-steelseries-apex-pro-tkl-gen3',
          'headsets-sennheiser-hd560s',
          'monitors-asus-rog-xg27aqdmg',
          'mice-endgame-gear-op1w',
          'chairs-andaseat-kaiser-4',
        ],
      },
      {
        label:    'v3 — Budget Grinders',
        products: [
          'mice-atk-vxe-mad-r',
          'keyboards-keychron-c3-pro',
          'headsets-astro-a10-gen2',
          'monitors-aoc-24g4xe',
          'chairs-corsair-tc100-relaxed',
          'mice-endgame-gear-op1w',
        ],
      },
    ],
  },


  /* ──────────────────────────────────────────────────────────
     3. STUDY MODE — Quiet, ergonomic, long sessions
     ────────────────────────────────────────────────────────── */
  {
    id:    'study-mode',
    label: 'Study Mode',
    emoji: '📚',
    color: '#0057FF',                          /* cobalt */
    baseProducts: [
      'keyboards-asus-rog-strix-scope-ii-96',
      'keyboards-aula-f99-wireless',
      'keyboards-keychron-c3-pro',
      'mice-lamzu-thorn-4k',
      'headsets-hyperx-cloud-iii-s-wireless',
      'headsets-bose-quietcomfort-ultra-gen2',
      'monitors-msi-mag-274updf',
      'chairs-sihoo-doro-c300',
      'chairs-eureka-typhon',
    ],
    shuffleVariants: [
      {
        label:    'v2 — Silent Setup',
        products: [
          'keyboards-asus-rog-strix-scope-ii-96',
          'mice-lamzu-thorn-4k',
          'headsets-bose-quietcomfort-ultra-gen2',
          'monitors-msi-mag-274updf',
          'chairs-sihoo-doro-c300',
        ],
      },
      {
        label:    'v3 — Student Budget',
        products: [
          'keyboards-keychron-c3-pro',
          'mice-atk-vxe-mad-r',
          'headsets-astro-a10-gen2',
          'monitors-aoc-24g4xe',
          'chairs-corsair-tc100-relaxed',
        ],
      },
    ],
  },


  /* ──────────────────────────────────────────────────────────
     4. KYNAR SETUP — Full bespoke, high-end "no compromise"
     ────────────────────────────────────────────────────────── */
  {
    id:    'kynar-setup',
    label: 'Kynar Setup',
    emoji: '⚡',
    color: '#C8FF00',                          /* volt */
    baseProducts: [
      'mice-razer-viper-v3-pro',
      'keyboards-keychron-q1-max',
      'headsets-steelseries-arctis-nova-pro',
      'headsets-bose-quietcomfort-ultra-gen2',
      'monitors-samsung-odyssey-g80sd',
      'monitors-asus-rog-xg27aqdmg',
      'chairs-andaseat-kaiser-4',
      'chairs-noblechairs-hero',
    ],
    shuffleVariants: [
      {
        label:    'v2 — Audiophile Angle',
        products: [
          'mice-endgame-gear-op1w',
          'keyboards-keychron-q1-max',
          'headsets-bose-quietcomfort-ultra-gen2',
          'headsets-sennheiser-hd560s',
          'monitors-samsung-odyssey-g80sd',
          'chairs-andaseat-kaiser-4',
        ],
      },
      {
        label:    'v3 — Precision Build',
        products: [
          'mice-endgame-gear-op1w',
          'keyboards-steelseries-apex-pro-tkl-gen3',
          'headsets-steelseries-arctis-nova-pro',
          'monitors-asus-rog-xg27aqdmg',
          'monitors-samsung-odyssey-g80sd',
          'chairs-noblechairs-hero',
        ],
      },
    ],
  },


  /* ──────────────────────────────────────────────────────────
     5. UNDER £100 — Budget only
     ────────────────────────────────────────────────────────── */
  {
    id:    'under-100',
    label: 'Under £100',
    emoji: '💷',
    color: '#00C853',                          /* jade */
    baseProducts: [
      'mice-atk-vxe-mad-r',
      'mice-lamzu-thorn-4k',
      'keyboards-keychron-c3-pro',
      'keyboards-aula-f99-wireless',
      'headsets-sennheiser-hd560s',
      'headsets-astro-a10-gen2',
    ],
    shuffleVariants: [
      {
        label:    'v2 — Bang-Per-Pound',
        products: [
          'mice-atk-vxe-mad-r',
          'keyboards-keychron-c3-pro',
          'headsets-astro-a10-gen2',
          'mice-lamzu-thorn-4k',
          'headsets-sennheiser-hd560s',
          'keyboards-aula-f99-wireless',
        ],
      },
    ],
  },


  /* ──────────────────────────────────────────────────────────
     6. COZY STATION — Warm desk aesthetic, comfort-first
     ────────────────────────────────────────────────────────── */
  {
    id:    'cozy-station',
    label: 'Cozy Station',
    emoji: '🍵',
    color: '#FF9500',                          /* amber */
    baseProducts: [
      'keyboards-keychron-q1-max',
      'keyboards-aula-f99-wireless',
      'mice-lamzu-thorn-4k',
      'mice-logitech-g502x-plus',
      'headsets-hyperx-cloud-iii-s-wireless',
      'monitors-aoc-q27g3xmn',
      'monitors-msi-mag-274updf',
      'chairs-andaseat-kaiser-4',
      'chairs-noblechairs-hero',
      'chairs-corsair-tc100-relaxed',
    ],
    shuffleVariants: [
      {
        label:    'v2 — Ambient Vibes',
        products: [
          'keyboards-aula-f99-wireless',
          'mice-lamzu-thorn-4k',
          'headsets-hyperx-cloud-iii-s-wireless',
          'monitors-msi-mag-274updf',
          'chairs-noblechairs-hero',
          'keyboards-keychron-q1-max',
        ],
      },
      {
        label:    'v3 — Budget Cozy',
        products: [
          'keyboards-aula-f99-wireless',
          'mice-lamzu-thorn-4k',
          'headsets-hyperx-cloud-iii-s-wireless',
          'monitors-aoc-q27g3xmn',
          'chairs-corsair-tc100-relaxed',
          'keyboards-keychron-c3-pro',
        ],
      },
    ],
  },


  /* ──────────────────────────────────────────────────────────
     7. WIRELESS ONLY — Zero cable builds
     ────────────────────────────────────────────────────────── */
  {
    id:    'wireless-only',
    label: 'Wireless Only',
    emoji: '📡',
    color: '#8E8EA0',                          /* slate */
    baseProducts: [
      'mice-razer-viper-v3-pro',
      'mice-endgame-gear-op1w',
      'mice-lamzu-thorn-4k',
      'mice-logitech-g502x-plus',
      'keyboards-asus-rog-strix-scope-ii-96',
      'keyboards-aula-f99-wireless',
      'keyboards-keychron-q1-max',
      'headsets-hyperx-cloud-iii-s-wireless',
      'headsets-steelseries-arctis-nova-pro',
      'headsets-bose-quietcomfort-ultra-gen2',
    ],
    shuffleVariants: [
      {
        label:    'v2 — Cable-Free Premium',
        products: [
          'mice-razer-viper-v3-pro',
          'keyboards-keychron-q1-max',
          'headsets-steelseries-arctis-nova-pro',
          'mice-lamzu-thorn-4k',
          'keyboards-asus-rog-strix-scope-ii-96',
          'headsets-bose-quietcomfort-ultra-gen2',
        ],
      },
      {
        label:    'v3 — Budget Wireless',
        products: [
          'mice-endgame-gear-op1w',
          'keyboards-asus-rog-strix-scope-ii-96',
          'headsets-hyperx-cloud-iii-s-wireless',
          'mice-lamzu-thorn-4k',
          'keyboards-aula-f99-wireless',
        ],
      },
    ],
  },


  /* ──────────────────────────────────────────────────────────
     8. CREATOR BAY — Content creation focus
     ────────────────────────────────────────────────────────── */
  {
    id:    'creator-bay',
    label: 'Creator Bay',
    emoji: '🎬',
    color: '#7B2FBE',                          /* purple */
    baseProducts: [
      'monitors-samsung-odyssey-g80sd',
      'monitors-msi-mag-274updf',
      'monitors-aoc-q27g3xmn',
      'keyboards-keychron-q1-max',
      'keyboards-asus-rog-strix-scope-ii-96',
      'mice-logitech-g502x-plus',
      'headsets-bose-quietcomfort-ultra-gen2',
      'headsets-steelseries-arctis-nova-pro',
      'chairs-sihoo-doro-c300',
      'chairs-andaseat-kaiser-4',
    ],
    shuffleVariants: [
      {
        label:    'v2 — Podcast Corner',
        products: [
          'headsets-bose-quietcomfort-ultra-gen2',
          'headsets-steelseries-arctis-nova-pro',
          'monitors-msi-mag-274updf',
          'keyboards-keychron-q1-max',
          'mice-logitech-g502x-plus',
          'chairs-sihoo-doro-c300',
        ],
      },
      {
        label:    'v3 — Stream Ready',
        products: [
          'monitors-samsung-odyssey-g80sd',
          'keyboards-asus-rog-strix-scope-ii-96',
          'mice-logitech-g502x-plus',
          'headsets-steelseries-arctis-nova-pro',
          'chairs-andaseat-kaiser-4',
          'monitors-msi-mag-274updf',
        ],
      },
    ],
  },

];


/* ─────────────────────────────────────────────────────────────
   UTILITY HELPERS
   ───────────────────────────────────────────────────────────── */

/**
 * Get a collection by ID
 * @param {string} id
 * @returns {Object|undefined}
 */
window.SP_getCollection = function(id) {
  return window.SP_COLLECTIONS.find(function(c) { return c.id === id; });
};

/**
 * Get the resolved product objects for a collection (base products)
 * Skips any IDs that don't resolve (safe fallback)
 * @param {string} collectionId
 * @returns {Array}
 */
window.SP_getCollectionProducts = function(collectionId) {
  var col = window.SP_getCollection(collectionId);
  if (!col) return window.SP_PRODUCTS;
  return col.baseProducts
    .map(function(id) { return window.SP_getProduct(id); })
    .filter(Boolean);
};

/**
 * Get products for a specific shuffle variant
 * @param {string} collectionId
 * @param {number} variantIndex  (0-based)
 * @returns {Array}
 */
window.SP_getShuffleVariant = function(collectionId, variantIndex) {
  var col = window.SP_getCollection(collectionId);
  if (!col || !col.shuffleVariants || !col.shuffleVariants[variantIndex]) {
    return window.SP_getCollectionProducts(collectionId);
  }
  return col.shuffleVariants[variantIndex].products
    .map(function(id) { return window.SP_getProduct(id); })
    .filter(Boolean);
};

/**
 * Get lightweight metadata for a collection (no product arrays)
 * @param {string} collectionId
 * @returns {{ id, label, emoji, color }|undefined}
 */
window.SP_getCollectionMeta = function(collectionId) {
  var col = window.SP_getCollection(collectionId);
  if (!col) return undefined;
  return { id: col.id, label: col.label, emoji: col.emoji, color: col.color };
};

/**
 * Get metadata for all collections (for patch rail rendering)
 * @returns {Array<{ id, label, emoji, color }>}
 */
window.SP_getAllCollectionMeta = function() {
  return window.SP_COLLECTIONS.map(function(col) {
    return { id: col.id, label: col.label, emoji: col.emoji, color: col.color };
  });
};
