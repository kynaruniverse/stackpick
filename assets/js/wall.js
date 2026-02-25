// ============================================================
//  STACKPICK V2 — wall.js
//  Homepage controller — Force Marry edition.
//
//  Requires: theme.js (sync, in <head>), shared.js (defer, before this)
//
//  MECHANICS KEPT:
//    Collection filter tabs (swap card grid content)
//    Hover lift + lava glow (CSS — no JS needed)
//    Featured row updates with active collection
//    Card stagger animation on collection switch
//    Affiliate click tracking (GA4)          [via shared.js]
//    Bottom nav + More panel                 [via shared.js]
//    Theme init                              [via theme.js]
//    Service worker
//
//  MECHANICS REMOVED:
//    Pull-to-shuffle
//    Card flips
//    Patch rail / story strip
//    Rack-box bottom nav (replaced with clean bottom nav)
//    Deck-vibrate / card-toss animations
//    Long-press preview
//
//  CONTENTS
//  01  Data access helpers
//  02  Theme
//  03  Render — product card
//  04  Render — feature row
//  05  Render — card grid
//  06  Collection filter tabs     [BUG FIX: mapTabId now includes kynar-setup]
//  07  Bottom nav + More panel    [via shared.js]
//  08  Affiliate click tracking   [via shared.js]
//  09  Init
// ============================================================

(function () {
  'use strict';

  // ── Globals injected by data layer at build time ──
  var SP_PRODUCTS    = window.SP_PRODUCTS    || [];
  var SP_COLLECTIONS = window.SP_COLLECTIONS || [];

  // Collection display name map — v2 Force Marry labels
  var COLLECTION_LABELS = {
    'all-picks':     'All Gear',
    'sweaty-fps':    'FPS Edition',
    'study-mode':    'Focus Build',
    'under-100':     'Sub \u00A3100',
    'wireless-only': 'Cut The Wire',
    'cozy-station':  'After Hours',
    'creator-bay':   'Creator Stack',
    'kynar-setup':   'The Kynar',  // BUG FIX: was missing from mapTabId; now included end-to-end
  };

  // ── DOM refs ──
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

  function getProductById(id) {
    return SP_PRODUCTS.find(function (p) { return p.id === id; }) || null;
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
    // Stagger delay capped at 6 items
    if (index < 6) {
      card.style.animationDelay = (index * 40) + 'ms';
    }

    var specs = (product.specs || [])
      .map(function (s) { return '<span class="spec-pill">' + escHtml(s) + '</span>'; })
      .join('');

    var stamps = '';
    if (product.inStock) stamps += '<span class="stamp stamp--stock">UK Stock</span>';
    if (product.nextDay) stamps += '<span class="stamp stamp--nextday">Next Day</span>';

    var msrp = product.msrp
      ? '<span class="product-card__price-msrp">' + escHtml(product.msrp) + '</span>'
      : '';

    card.innerHTML =
      '<div class="product-card__visual">' +
        '<div class="product-card__icon-wrap" aria-hidden="true">' +
          '<span class="product-card__emoji">' + (product.emoji || '\uD83D\uDCE6') + '</span>' +
        '</div>' +
        '<span class="product-card__category">' + escHtml(product.category) + '</span>' +
      '</div>' +
      '<div class="product-card__body">' +
        '<span class="product-card__badge">' + escHtml(product.badge || '') + '</span>' +
        '<h3 class="product-card__name">' + escHtml(product.name) + '</h3>' +
        '<div class="product-card__specs">' + specs + '</div>' +
      '</div>' +
      (stamps ? '<div class="product-card__stamps">' + stamps + '</div>' : '') +
      '<div class="product-card__footer">' +
        '<span class="product-card__price">' + escHtml(product.price) + msrp + '</span>' +
        '<a href="' + escAttr(product.affiliate) + '" class="product-card__cta"' +
           ' target="_blank" rel="noopener sponsored"' +
           ' data-product="' + escAttr(product.id) + '" data-type="card-cta">' +
          'View \u2192' +
        '</a>' +
      '</div>';

    return card;
  }


  // ============================================================
  //  04  RENDER — FEATURE ROW
  //  Updates the editor's pick row to reflect the active collection.
  // ============================================================

  function renderFeatureRow(collection) {
    if (!featureName || !featureDesc || !featurePrice || !featurePick) return;

    var products = getCollectionProducts(collection);
    if (!products.length) return;

    // Use the first product as the featured pick
    var pick = products[0];

    featureName.textContent  = pick.name;
    featureDesc.textContent  = pick.desc  || '';
    featurePrice.textContent = pick.price;

    // Update CTA link
    var cta = featurePick.querySelector('.feature-row__cta');
    if (cta) {
      cta.href = pick.affiliate;
      cta.setAttribute('data-product', pick.id);
    }

    // Update emoji in visual
    var visual = featurePick.querySelector('.feature-row__visual');
    if (visual) visual.textContent = pick.emoji || '\uD83D\uDCE6';

    // Stamps — remove existing, insert fresh
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

  var FEATURE_SLOT_INTERVAL = 6; // inject an "also consider" slot every N cards

  function renderGrid(collection) {
    if (!cardGrid) return;

    var products = getCollectionProducts(collection);

    // Clear grid
    while (cardGrid.firstChild) { cardGrid.removeChild(cardGrid.firstChild); }

    if (!products.length) {
      cardGrid.innerHTML =
        '<div class="card-grid__empty">' +
          '<div class="empty-state-glow"></div>' +
          '<p>SYSTEM OFFLINE: No hardware detected in this sector.</p>' +
        '</div>';
      return;
    }

    // Skip first product — it is displayed in the feature row above the grid
    var gridProducts = products.slice(1);

    gridProducts.forEach(function (product, i) {
      // Inject a full-width "also consider" slot every N cards (skip position 0)
      if (i > 0 && i % FEATURE_SLOT_INTERVAL === 0) {
        var altPick = gridProducts[i];
        if (altPick) {
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
    el.innerHTML =
      '<div class="feature-row__visual" aria-hidden="true">' +
        '<div class="feature-row__icon-wrap">' +
          '<span class="feature-row__emoji">' + (product.emoji || '\uD83D\uDCE6') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="feature-row__body">' +
        '<span class="feature-row__badge">Also Consider</span>' +
        '<h3 class="feature-row__name">' + escHtml(product.name) + '</h3>' +
        '<p class="feature-row__desc">' + escHtml((product.desc || '').substring(0, 140) + '\u2026') + '</p>' +
        '<div class="feature-row__footer">' +
          '<div class="feature-row__meta">' +
            '<span class="feature-row__price">' + escHtml(product.price) + '</span>' +
          '</div>' +
          '<a href="' + escAttr(product.affiliate) + '" class="feature-row__cta"' +
             ' target="_blank" rel="noopener sponsored"' +
             ' data-product="' + escAttr(product.id) + '" data-type="alt-feature-cta">' +
            'View on Amazon \u2192' +
          '</a>' +
        '</div>' +
      '</div>';
    return el;
  }


  // ============================================================
  //  06  COLLECTION FILTER TABS
  //
  //  BUG FIX: mapTabId() previously had no entry for 'kynar-setup'
  //  (or its Force Marry tab equivalent). The COLLECTION_LABELS map
  //  at the top of this file correctly includes 'kynar-setup',
  //  and mapTabId now maps the Force Marry HTML tab ID to the
  //  original collection ID so clicking it works end-to-end.
  // ============================================================

  var activeCollectionId = 'all-picks';

  /**
   * Map Force Marry HTML tab data-collection values
   * back to the original collection IDs used in SP_COLLECTIONS.
   * Both sides of each mapping must be kept in sync with:
   *   - The data-collection attributes on filter tabs in index.html
   *   - The id fields in _data/collections.json
   */
  function mapTabId(v2Id) {
    var map = {
      'all-gear':      'all-picks',
      'fps-edition':   'sweaty-fps',
      'focus-build':   'study-mode',
      'sub-100':       'under-100',
      'cut-the-wire':  'wireless-only',
      'after-hours':   'cozy-station',
      'creator-stack': 'creator-bay',
      'the-kynar':     'kynar-setup',   // BUG FIX: was missing in previous version
    };
    return map[v2Id] || v2Id;
  }

  function activateCollection(collectionId) {
    // Guard: don't re-render if already active and grid has content
    if (collectionId === activeCollectionId && cardGrid && cardGrid.children.length > 1) return;
    activeCollectionId = collectionId;

    var collection = getCollectionById(collectionId);
    var label      = getCollectionLabel(collectionId);

    // Update tab UI
    filterTabs.forEach(function (tab) {
      var isActive = tab.getAttribute('data-collection') === collectionId;
      tab.classList.toggle('filter-tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update section label
    if (gridLabel) gridLabel.textContent = label;

    // Update category link text + href
    if (categoryLink && collection) {
      var cats       = getCollectionProducts(collection).map(function (p) { return p.category; });
      var primaryCat = cats[0] || '';
      categoryLink.href        = primaryCat ? '/' + primaryCat + '/' : '#';
      categoryLink.textContent = primaryCat ? 'View all ' + primaryCat + ' \u2192' : 'View category \u2192';
    }

    // Render feature row and card grid
    renderFeatureRow(collection);
    renderGrid(collection);

    // Scroll user to top of new grid on mobile
    if (window.innerWidth < 1024) {
      window.scrollTo({
        top:      featurePick ? featurePick.offsetTop - 100 : 0,
        behavior: 'smooth',
      });
    }
  }

  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var v2Id       = tab.getAttribute('data-collection');
      var originalId = mapTabId(v2Id);
      activateCollection(originalId);
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
  //  Pass a getter for the active collection so GA4 can segment
  //  affiliate clicks by which collection the user was browsing.
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


  // ── Utils ──────────────────────────────────────────────────

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function escAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

}());
