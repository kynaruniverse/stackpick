// ============================================================
//  STACKPICK V2 — wall.js
//  Homepage controller — Force Marry edition.
//
//  Requires:
//    theme.js  (synchronous, in <head>)
//    shared.js (defer, before this)
//
//  FIXES vs previous version:
//    1. escHtml / escAttr: no longer duplicated here. Delegated to
//       SP_shared.escHtml and SP_shared.escAttr. Local shims are
//       kept as fallbacks in case shared.js fails to load, but the
//       primary path now uses the shared versions.
//
//    2. mapTabId() hoisted MAP constant to module level — was re-creating
//       a new object on every tab click (allocation on every interaction).
//
//    3. renderFeatureRow() and renderGrid() previously called
//       getCollectionProducts() independently. activateCollection() now
//       computes products once and passes them to both.
//
//    4. buildAltFeature() description truncation: ellipsis now only added
//       if the description is actually longer than 140 characters.
//
//    5. "Also consider" slot was injecting the same product as the card
//       directly below it (gridProducts[i] before the card at index i).
//       Fixed to use the previous product (i - FEATURE_SLOT_INTERVAL)
//       as the featured item, ensuring it's always a different card.
//
//  CONTENTS
//  01  Data access helpers
//  02  Theme
//  03  Render — product card
//  04  Render — feature row
//  05  Render — card grid
//  06  Collection filter tabs
//  07  Bottom nav + More panel    [via shared.js]
//  08  Affiliate click tracking   [via shared.js]
//  09  Init
// ============================================================

(function () {
  'use strict';

  // ── Globals injected by data layer at build time ──────────────────────────
  var SP_PRODUCTS    = window.SP_PRODUCTS    || [];
  var SP_COLLECTIONS = window.SP_COLLECTIONS || [];

  // Collection display name map
  var COLLECTION_LABELS = {
    'all-picks':     'All Gear',
    'sweaty-fps':    'FPS Edition',
    'study-mode':    'Focus Build',
    'under-100':     'Sub \u00A3100',
    'wireless-only': 'Cut The Wire',
    'cozy-station':  'After Hours',
    'creator-bay':   'Creator Stack',
    'kynar-setup':   'The Kynar',
  };

  // ── Tab ID mapping — hoisted to module level (was re-created on every click) ──
  var TAB_ID_MAP = {
    'all-gear':      'all-picks',
    'fps-edition':   'sweaty-fps',
    'focus-build':   'study-mode',
    'sub-100':       'under-100',
    'cut-the-wire':  'wireless-only',
    'after-hours':   'cozy-station',
    'creator-stack': 'creator-bay',
    'the-kynar':     'kynar-setup',
  };

  // ── DOM refs ──────────────────────────────────────────────────────────────
  var cardGrid     = document.getElementById('card-grid');
  var filterTabs   = document.querySelectorAll('.filter-tab');
  var featureName  = document.getElementById('feature-name');
  var featureDesc  = document.getElementById('feature-desc');
  var featurePrice = document.getElementById('feature-price');
  var featurePick  = document.getElementById('feature-pick');
  var gridLabel    = document.getElementById('grid-collection-label');
  var categoryLink = document.getElementById('category-link');


  // ============================================================
  //  01  DATA ACCESS HELPERS
  // ============================================================

  // Product lookup map — O(1) by id, built once instead of using .find() on every lookup
  var _productMap = null;

  function getProductMap() {
    if (_productMap) return _productMap;
    _productMap = new Map();
    SP_PRODUCTS.forEach(function (p) { _productMap.set(p.id, p); });
    return _productMap;
  }

  function getProductById(id) {
    return getProductMap().get(id) || null;
  }

  function getCollectionById(id) {
    return SP_COLLECTIONS.find(function (c) { return c.id === id; }) || null;
  }

  function getCollectionProducts(collection) {
    if (!collection) return [];
    return (collection.baseProducts || []).map(getProductById).filter(Boolean);
  }

  function getCollectionLabel(collectionId) {
    return COLLECTION_LABELS[collectionId] || collectionId;
  }


  // ============================================================
  //  02  THEME
  // ============================================================

  if (typeof window.SP_initTheme === 'function') {
    window.SP_initTheme();
  }


  // ============================================================
  //  03  RENDER — PRODUCT CARD
  // ============================================================

  function renderCard(product, index) {
    var card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('aria-label', product.name);

    // Stagger animation — capped at 6 items (240ms max)
    if (index < 6) {
      card.style.animationDelay = (index * 40) + 'ms';
    }

    var specs = (product.specs || [])
      .map(function (s) { return '<span class="spec-pill">' + esc(s) + '</span>'; })
      .join('');

    var stamps = '';
    if (product.inStock) stamps += '<span class="stamp stamp--stock">UK Stock</span>';
    if (product.nextDay) stamps += '<span class="stamp stamp--nextday">Next Day</span>';

    var msrp = product.msrp
      ? '<span class="product-card__price-msrp">' + esc(product.msrp) + '</span>'
      : '';

    card.innerHTML =
      '<div class="product-card__visual">' +
        '<div class="product-card__icon-wrap" aria-hidden="true">' +
          '<span class="product-card__emoji">' + (product.emoji || '\uD83D\uDCE6') + '</span>' +
        '</div>' +
        '<span class="product-card__category">' + esc(product.category) + '</span>' +
      '</div>' +
      '<div class="product-card__body">' +
        '<span class="product-card__badge">' + esc(product.badge || '') + '</span>' +
        '<h3 class="product-card__name">' + esc(product.name) + '</h3>' +
        '<div class="product-card__specs">' + specs + '</div>' +
      '</div>' +
      (stamps ? '<div class="product-card__stamps">' + stamps + '</div>' : '') +
      '<div class="product-card__footer">' +
        '<span class="product-card__price">' + esc(product.price) + msrp + '</span>' +
        '<a href="' + escA(product.affiliate) + '" class="product-card__cta"' +
           ' target="_blank" rel="noopener sponsored"' +
           ' data-product="' + escA(product.id) + '" data-type="card-cta">' +
          'View \u2192' +
        '</a>' +
      '</div>';

    return card;
  }


  // ============================================================
  //  04  RENDER — FEATURE ROW
  // ============================================================

  function renderFeatureRow(products) {
    if (!featureName || !featureDesc || !featurePrice || !featurePick) return;
    if (!products.length) return;

    var pick = products[0];

    featureName.textContent  = pick.name;
    featureDesc.textContent  = pick.desc  || '';
    featurePrice.textContent = pick.price;

    var cta = featurePick.querySelector('.feature-row__cta');
    if (cta) {
      cta.href = pick.affiliate;
      cta.setAttribute('data-product', pick.id);
    }

    var visual = featurePick.querySelector('.feature-row__visual');
    if (visual) visual.textContent = pick.emoji || '\uD83D\uDCE6';

    var meta = featurePick.querySelector('.feature-row__meta');
    if (meta) {
      meta.querySelectorAll('.stamp').forEach(function (s) { s.remove(); });
      if (pick.inStock) {
        var s1 = document.createElement('span');
        s1.className = 'stamp stamp--stock';
        s1.textContent = 'UK Stock';
        meta.insertBefore(s1, cta);
      }
      if (pick.nextDay) {
        var s2 = document.createElement('span');
        s2.className = 'stamp stamp--nextday';
        s2.textContent = 'Next Day';
        meta.insertBefore(s2, cta);
      }
    }
  }


  // ============================================================
  //  05  RENDER — CARD GRID
  // ============================================================

  var FEATURE_SLOT_INTERVAL = 6;

  function renderGrid(products) {
    if (!cardGrid) return;

    // Clear grid
    cardGrid.replaceChildren();

    if (!products.length) {
      cardGrid.innerHTML =
        '<div class="card-grid__empty">' +
          '<div class="empty-state-glow"></div>' +
          '<p>SYSTEM OFFLINE: No hardware detected in this sector.</p>' +
        '</div>';
      return;
    }

    // First product is displayed in feature row, skip in grid
    var gridProducts = products.slice(1);

    gridProducts.forEach(function (product, i) {
      // FIX: "Also consider" slot was previously injecting gridProducts[i]
      // which is the SAME product about to be rendered as a card directly below.
      // Now uses a product from earlier in the list so it's always different.
      if (i > 0 && i % FEATURE_SLOT_INTERVAL === 0) {
        var altIndex = i - Math.floor(FEATURE_SLOT_INTERVAL / 2);
        var altPick  = gridProducts[altIndex >= 0 ? altIndex : 0];
        if (altPick && altPick.id !== product.id) {
          var slot = document.createElement('div');
          slot.className = 'card-grid__feature-slot';
          slot.setAttribute('aria-hidden', 'true');
          slot.appendChild(buildAltFeature(altPick));
          cardGrid.appendChild(slot);
        }
      }
      cardGrid.appendChild(renderCard(product, i));
    });
  }

  function buildAltFeature(product) {
    var el = document.createElement('article');
    el.className = 'feature-row';
    el.setAttribute('aria-label', 'Featured: ' + product.name);

    // FIX: only add ellipsis if description is actually truncated
    var rawDesc = product.desc || '';
    var desc = rawDesc.length > 140
      ? rawDesc.substring(0, 140) + '\u2026'
      : rawDesc;

    el.innerHTML =
      '<div class="feature-row__visual" aria-hidden="true">' +
        '<div class="feature-row__icon-wrap">' +
          '<span class="feature-row__emoji">' + (product.emoji || '\uD83D\uDCE6') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="feature-row__body">' +
        '<span class="feature-row__badge">Also Consider</span>' +
        '<h3 class="feature-row__name">' + esc(product.name) + '</h3>' +
        '<p class="feature-row__desc">' + esc(desc) + '</p>' +
        '<div class="feature-row__footer">' +
          '<div class="feature-row__meta">' +
            '<span class="feature-row__price">' + esc(product.price) + '</span>' +
          '</div>' +
          '<a href="' + escA(product.affiliate) + '" class="feature-row__cta"' +
             ' target="_blank" rel="noopener sponsored"' +
             ' data-product="' + escA(product.id) + '" data-type="alt-feature-cta">' +
            'View on Amazon \u2192' +
          '</a>' +
        '</div>' +
      '</div>';
    return el;
  }


  // ============================================================
  //  06  COLLECTION FILTER TABS
  // ============================================================

  var activeCollectionId = 'all-picks';

  function mapTabId(v2Id) {
    return TAB_ID_MAP[v2Id] || v2Id;
  }

  function activateCollection(collectionId) {
    if (collectionId === activeCollectionId && cardGrid && cardGrid.children.length > 1) return;
    activeCollectionId = collectionId;

    var collection = getCollectionById(collectionId);
    var label      = getCollectionLabel(collectionId);
    var products   = getCollectionProducts(collection); // computed once, passed to both renderers

    // Update tab UI
    filterTabs.forEach(function (tab) {
      var tabCollectionId = mapTabId(tab.getAttribute('data-collection'));
      var isActive = tabCollectionId === collectionId;
      tab.classList.toggle('filter-tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update section label
    if (gridLabel) gridLabel.textContent = label;

    // Update category link
    if (categoryLink && products.length) {
      var primaryCat = products[0].category || '';
      categoryLink.href        = primaryCat ? '/' + primaryCat + '/' : '#';
      categoryLink.textContent = primaryCat ? 'View all ' + primaryCat + ' \u2192' : 'View category \u2192';
    }

    // FIX: pass pre-computed products to both renderers (was computed twice)
    renderFeatureRow(products);
    renderGrid(products);

    // Scroll to grid top on mobile
    if (window.innerWidth < 1024 && featurePick) {
      window.scrollTo({ top: featurePick.offsetTop - 100, behavior: 'smooth' });
    }
  }

  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateCollection(mapTabId(tab.getAttribute('data-collection')));
    });
  });


  // ============================================================
  //  07  BOTTOM NAV + MORE PANEL  [shared.js]
  // ============================================================

  if (window.SP_shared) {
    window.SP_shared.initBottomNav();
    window.SP_shared.initMorePanel(
      document.getElementById('more-btn'),
      document.getElementById('more-panel'),
      document.getElementById('more-overlay')
    );
  }


  // ============================================================
  //  08  AFFILIATE CLICK TRACKING  [shared.js]
  // ============================================================

  if (window.SP_shared) {
    window.SP_shared.initAffiliateTracking(function () {
      return { collection: activeCollectionId };
    });
  }


  // ============================================================
  //  09  INIT
  // ============================================================

  function init() {
    activateCollection('all-picks');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }


  // ── Utils (local shims — prefer SP_shared versions) ──────────────────────
  // These shims exist as a safety net if shared.js fails to load.
  // In normal operation, use window.SP_shared.escHtml / escAttr instead.

  function esc(str) {
    if (window.SP_shared) return window.SP_shared.escHtml(str);
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function escA(str) {
    if (window.SP_shared) return window.SP_shared.escAttr(str);
    return String(str == null ? '' : str).replace(/"/g, '&quot;');
  }

}());
