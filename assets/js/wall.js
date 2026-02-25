// ============================================================
//  STACKPICK V2 — wall.js
//  Homepage controller — Force Marry edition.
//
//  MECHANICS KEPT:
//    ✅ Collection filter tabs (swap card grid content)
//    ✅ Hover lift + lava glow (CSS — no JS needed)
//    ✅ Featured row updates with active collection
//    ✅ Card stagger animation on collection switch
//    ✅ Affiliate click tracking (GA4)
//    ✅ Bottom nav More panel
//    ✅ Theme init
//    ✅ Service worker
//
//  MECHANICS REMOVED:
//    ❌ Pull-to-shuffle
//    ❌ Card flips
//    ❌ Patch rail / story strip
//    ❌ Rack-box bottom nav (replaced with clean bottom nav)
//    ❌ Deck-vibrate / card-toss animations
//    ❌ Long-press preview
//
//  CONTENTS
//  01  Data access helpers
//  02  Theme
//  03  Render — product card
//  04  Render — feature row
//  05  Render — card grid
//  06  Collection filter tabs
//  07  Bottom nav + More panel
//  08  Affiliate click tracking
//  09  Init
// ============================================================

(function () {
  'use strict';

  // ── Expect these globals from products.js / collections.js ──
  // SP_PRODUCTS:    Array of product objects
  // SP_COLLECTIONS: Array of collection objects
  // Both injected by the data layer at build time.

  var SP_PRODUCTS    = window.SP_PRODUCTS    || [];
  var SP_COLLECTIONS = window.SP_COLLECTIONS || [];

  // Collection name map — old IDs to new Force Marry labels
  var COLLECTION_LABELS = {
    'all-picks':     'All Gear',
    'sweaty-fps':    'FPS Edition',
    'study-mode':    'Focus Build',
    'under-100':     'Sub £100',
    'wireless-only': 'Cut The Wire',
    'cozy-station':  'After Hours',
    'creator-bay':   'Creator Stack',
    'kynar-setup':   'The Kynar',
  };

  // ── DOM refs ──
  var cardGrid         = document.getElementById('card-grid');
  var filterTabs       = document.querySelectorAll('.filter-tab');
  var featureName      = document.getElementById('feature-name');
  var featureDesc      = document.getElementById('feature-desc');
  var featurePrice     = document.getElementById('feature-price');
  var featurePick      = document.getElementById('feature-pick');
  var gridLabel        = document.getElementById('grid-collection-label');
  var categoryLink     = document.getElementById('category-link');
  var moreBtn          = document.getElementById('more-btn');
  var morePanel        = document.getElementById('more-panel');
  var moreOverlay      = document.getElementById('more-overlay');


  // ============================================================
  //  01  DATA ACCESS HELPERS
  // ============================================================

  function getProductById(id) {
    return SP_PRODUCTS.find(function(p) { return p.id === id; }) || null;
  }

  function getCollectionById(id) {
    return SP_COLLECTIONS.find(function(c) { return c.id === id; }) || null;
  }

  function getCollectionProducts(collection) {
    if (!collection) return [];
    var ids = collection.baseProducts || [];
    return ids
      .map(getProductById)
      .filter(Boolean);
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
      .map(function(s) {
        return '<span class="spec-pill">' + escHtml(s) + '</span>';
      })
      .join('');

    var stamps = '';
    if (product.inStock) stamps += '<span class="stamp stamp--stock">UK Stock</span>';
    if (product.nextDay) stamps += '<span class="stamp stamp--nextday">Next Day</span>';

    var msrp = product.msrp
      ? '<span class="product-card__price-msrp">' + escHtml(product.msrp) + '</span>'
      : '';

    card.innerHTML =
      '<div class="product-card__visual">' +
        '<span aria-hidden="true">' + (product.emoji || '📦') + '</span>' +
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
          'View →' +
        '</a>' +
      '</div>';

    return card;
  }


  // ============================================================
  //  04  RENDER — FEATURE ROW
  //  Updates the editor's pick row to reflect active collection.
  // ============================================================

  function renderFeatureRow(collection) {
    if (!featureName || !featureDesc || !featurePrice || !featurePick) return;

    var products = getCollectionProducts(collection);
    if (!products.length) return;

    // Use the first product as the featured pick
    var pick = products[0];

    featureName.textContent  = pick.name;
    featureDesc.textContent  = pick.desc || '';
    featurePrice.textContent = pick.price;

    // Update CTA link
    var cta = featurePick.querySelector('.feature-row__cta');
    if (cta) {
      cta.href = pick.affiliate;
      cta.setAttribute('data-product', pick.id);
    }

    // Update emoji in visual
    var visual = featurePick.querySelector('.feature-row__visual');
    if (visual) visual.textContent = pick.emoji || '📦';

    // Stamps
    var meta = featurePick.querySelector('.feature-row__meta');
    if (meta) {
      var existingStamps = meta.querySelectorAll('.stamp');
      existingStamps.forEach(function(s) { s.remove(); });
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

  var FEATURE_SLOT_INTERVAL = 6; // inject a feature slot every N cards

  function renderGrid(collection) {
    if (!cardGrid) return;

    var products = getCollectionProducts(collection);

    // Clear grid
    while (cardGrid.firstChild) {
      cardGrid.removeChild(cardGrid.firstChild);
    }

    if (!products.length) {
      var empty = document.createElement('p');
      empty.className = 'card-grid__empty';
      empty.textContent = 'No picks in this collection yet.';
      cardGrid.appendChild(empty);
      return;
    }

    // Skip first product — it's the feature row
    var gridProducts = products.slice(1);

    gridProducts.forEach(function(product, i) {
      // Inject a full-width feature slot every N cards (except first position)
      if (i > 0 && i % FEATURE_SLOT_INTERVAL === 0) {
        var slot = document.createElement('div');
        slot.className = 'card-grid__feature-slot';
        slot.setAttribute('aria-hidden', 'true');
        // Secondary feature highlight — muted version
        var altPick = gridProducts[i];
        if (altPick) {
          var altCard = buildAltFeature(altPick);
          slot.appendChild(altCard);
          cardGrid.appendChild(slot);
        }
      }

      cardGrid.appendChild(renderCard(product, i));
    });
  }

  function buildAltFeature(product) {
    // Inline mini feature — sits in the full-width grid slot
    var el = document.createElement('article');
    el.className = 'feature-row';
    el.setAttribute('aria-label', 'Featured: ' + product.name);
    el.innerHTML =
      '<div class="feature-row__visual" aria-hidden="true">' + (product.emoji || '📦') + '</div>' +
      '<div class="feature-row__body">' +
        '<span class="feature-row__badge">Also Consider</span>' +
        '<h3 class="feature-row__name">' + escHtml(product.name) + '</h3>' +
        '<p class="feature-row__desc">' + escHtml((product.desc || '').substring(0, 140) + '…') + '</p>' +
        '<div class="feature-row__footer">' +
          '<div class="feature-row__meta">' +
            '<span class="feature-row__price">' + escHtml(product.price) + '</span>' +
          '</div>' +
          '<a href="' + escAttr(product.affiliate) + '" class="feature-row__cta"' +
             ' target="_blank" rel="noopener sponsored"' +
             ' data-product="' + escAttr(product.id) + '" data-type="alt-feature-cta">' +
            'View on Amazon →' +
          '</a>' +
        '</div>' +
      '</div>';
    return el;
  }


  // ============================================================
  //  06  COLLECTION FILTER TABS
  // ============================================================

  var activeCollectionId = 'all-picks';

  function activateCollection(collectionId) {
    if (collectionId === activeCollectionId && cardGrid.children.length > 1) return;
    activeCollectionId = collectionId;

    var collection = getCollectionById(collectionId);
    var label = getCollectionLabel(collectionId);

    // Update tab UI
    filterTabs.forEach(function(tab) {
      var isActive = tab.getAttribute('data-collection') === collectionId;
      tab.classList.toggle('filter-tab--active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update section label
    if (gridLabel) gridLabel.textContent = label;

    // Update category link
    if (categoryLink && collection) {
      var cats = getCollectionProducts(collection).map(function(p) { return p.category; });
      var primaryCat = cats[0] || '';
      categoryLink.href = primaryCat ? '/' + primaryCat + '/' : '#';
      categoryLink.textContent = primaryCat
        ? 'View all ' + primaryCat + ' →'
        : 'View category →';
    }

    // Update feature row + grid
    renderFeatureRow(collection);
    renderGrid(collection);
  }

  filterTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      // Map v2 tab IDs back to original collection IDs
      var v2Id = tab.getAttribute('data-collection');
      var originalId = mapTabId(v2Id);
      activateCollection(originalId);
    });
  });

  // Map Force Marry tab IDs → original collection IDs in data
  function mapTabId(v2Id) {
    var map = {
      'all-gear':     'all-picks',
      'fps-edition':  'sweaty-fps',
      'focus-build':  'study-mode',
      'sub-100':      'under-100',
      'cut-the-wire': 'wireless-only',
      'after-hours':  'cozy-station',
      'creator-stack':'creator-bay',
    };
    return map[v2Id] || v2Id;
  }


  // ============================================================
  //  07  BOTTOM NAV + MORE PANEL
  // ============================================================

  function isMoreOpen() {
    return morePanel && morePanel.getAttribute('aria-hidden') === 'false';
  }

  function openMore() {
    if (!morePanel || !moreOverlay || !moreBtn) return;
    morePanel.setAttribute('aria-hidden', 'false');
    moreOverlay.setAttribute('aria-hidden', 'false');
    moreOverlay.classList.add('open');
    moreBtn.setAttribute('aria-expanded', 'true');
    var first = morePanel.querySelector('a');
    if (first) first.focus();
  }

  function closeMore() {
    if (!morePanel || !moreOverlay || !moreBtn) return;
    morePanel.setAttribute('aria-hidden', 'true');
    moreOverlay.setAttribute('aria-hidden', 'true');
    moreOverlay.classList.remove('open');
    moreBtn.setAttribute('aria-expanded', 'false');
    moreBtn.focus();
  }

  if (moreBtn)     moreBtn.addEventListener('click', function() { isMoreOpen() ? closeMore() : openMore(); });
  if (moreOverlay) moreOverlay.addEventListener('click', closeMore);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isMoreOpen()) closeMore();
  });

  // Active bottom nav state
  var normPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.bottom-nav__link[data-nav-path]').forEach(function(link) {
    var lp = (link.getAttribute('data-nav-path') || '').replace(/\/$/, '') || '/';
    if (lp === normPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });


  // ============================================================
  //  08  AFFILIATE CLICK TRACKING
  // ============================================================

  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') { el = el.parentElement; }
    if (!el || !el.href) return;

    var isAffiliate = el.href.includes('amzn.to') || el.href.includes('amazon.co.uk');
    var productId   = el.getAttribute('data-product') || '';
    var type        = el.getAttribute('data-type')    || 'link';

    if (isAffiliate && typeof gtag === 'function') {
      gtag('event', 'affiliate_click', {
        link_url:    el.href,
        product_id:  productId,
        click_type:  type,
        page_path:   window.location.pathname,
      });
    }
  });


  // ============================================================
  //  09  INIT
  // ============================================================

  function init() {
    // Render default collection on load
    activateCollection('all-picks');
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }


  // ── Utils ──

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

}());
