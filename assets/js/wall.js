/* ============================================================
   STACK PICK — wall.js  PHASE 6E
   ============================================================ */

(function () {
  'use strict';

  var html = document.documentElement;

  var SEAM_COLOURS = {
    mice:      '#FF2D55',
    keyboards: '#0057FF',
    headsets:  '#8E8EA0',
    monitors:  '#FF9500',
    chairs:    '#00C853',
  };
  var SEAM_GLOWS = {
    mice:      'rgba(255,45,85,0.15)',
    keyboards: 'rgba(0,87,255,0.15)',
    headsets:  'rgba(142,142,160,0.15)',
    monitors:  'rgba(255,149,0,0.15)',
    chairs:    'rgba(0,200,83,0.15)',
  };

  var state = {
    activeCollectionId: 'all-picks',
    shuffleStep:        0,
    isTransitioning:    false,
    isShuffle:          false,
    sortMode:           'default',
    jiggleScrollY:      0,
    pull: {
      active:      false,
      startY:      0,
      currentDelta:0,
      triggered:   false,
    },
  };

  var CARD_STAGGER_MS   = 55;
  var CARD_ENTER_LIMIT  = 10;
  var CLUSTER_EVERY     = 5;
  var TRANSITION_OUT_MS = 180;

  var PULL_SHOW_AT    = 24;
  var PULL_TRIGGER    = 80;
  var PULL_MAX        = 120;
  var PULL_RESIST     = 0.38;

  var FLIP_COMPRESS_MS  = 180;
  var FLIP_HOLD_MS      = 60;
  var FLIP_EXPAND_MS    = 280;
  var FLIP_STAGGER_MS   = 30;

  var HAPTIC_PULL_TICK  = [6];
  var HAPTIC_TRIGGERED  = [15, 30, 12];
  var HAPTIC_SHUFFLE    = [20, 40, 15, 20, 10];
  var HAPTIC_NO_VARIANT = [8, 8, 8];

  // 6E: Shadow lags at this fraction of scroll — simulates fixed light source
  var SHADOW_LAG = 0.12;


  /* 01  THEME */

  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  function getSavedTheme() { try { return localStorage.getItem('sp-theme'); } catch (e) { return null; } }
  function saveTheme(t) { try { localStorage.setItem('sp-theme', t); } catch (e) {} }
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    var isDark = theme === 'dark';
    var icon   = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    var label  = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      var sp = btn.querySelector('.theme-toggle__icon');
      if (sp) sp.textContent = icon;
      btn.setAttribute('aria-label', label);
    });
    var railBtn = document.getElementById('patch-rail-theme');
    if (railBtn) { var rs = railBtn.querySelector('.patch-rail__theme-icon'); if (rs) rs.textContent = icon; }
    var pv = document.getElementById('pref-theme-val');
    if (pv) pv.textContent = isDark ? 'Dark' : 'Light';
  }
  function toggleTheme() {
    var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next); saveTheme(next);
  }
  applyTheme(getSavedTheme() || getSystemTheme());


  /* 02  PREFERENCES SHEET */

  function initPrefsSheet() {
    var sheet   = document.getElementById('prefs-sheet');
    var overlay = document.getElementById('prefs-overlay');
    var chip    = document.getElementById('guest-chip');
    var close   = document.getElementById('prefs-close');
    function openSheet() {
      sheet.classList.add('prefs-sheet--open'); overlay.classList.add('open');
      sheet.setAttribute('aria-hidden', 'false'); overlay.setAttribute('aria-hidden', 'false');
      if (chip) chip.setAttribute('aria-expanded', 'true'); if (close) close.focus();
    }
    function closeSheet() {
      sheet.classList.remove('prefs-sheet--open'); overlay.classList.remove('open');
      sheet.setAttribute('aria-hidden', 'true'); overlay.setAttribute('aria-hidden', 'true');
      if (chip) chip.setAttribute('aria-expanded', 'false');
    }
    if (chip)    chip.addEventListener('click', openSheet);
    if (close)   close.addEventListener('click', closeSheet);
    if (overlay) overlay.addEventListener('click', closeSheet);
    document.querySelectorAll('.theme-toggle').forEach(function (btn) { btn.addEventListener('click', toggleTheme); });
    var railTheme = document.getElementById('patch-rail-theme');
    if (railTheme) railTheme.addEventListener('click', toggleTheme);
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!getSavedTheme()) applyTheme(e.matches ? 'dark' : 'light');
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeSheet(); closeRackSheet(); closeSortMenu(); }
    });
  }


  /* 03  UTILITY RACK + RACK SHEET */

  var _rackSheet = null, _rackOverlay = null;
  function closeRackSheet() {
    if (!_rackSheet) return;
    _rackSheet.classList.remove('rack-sheet--open'); _rackOverlay.classList.remove('open');
    _rackSheet.setAttribute('aria-hidden', 'true'); _rackOverlay.setAttribute('aria-hidden', 'true');
  }
  var RACK_CONTENT = {
    browse:   [{ label: '\uD83C\uDFA7 Headsets', href: '/headsets/' }, { label: '\u2328\uFE0F Keyboards', href: '/keyboards/' }, { label: '\uD83D\uDDB1\uFE0F Mice', href: '/mice/' }, { label: '\uD83D\uDDA5\uFE0F Monitors', href: '/monitors/' }, { label: '\uD83E\uDE91 Chairs', href: '/chairs/' }],
    loadouts: [{ label: '\uD83D\uDCCB Setup Guides', href: '/guides/' }, { label: '\u2696\uFE0F Comparisons', href: '/comparisons/' }, { label: '\uD83C\uDFAE \u00A3500 Build', href: '/guides/gaming-setup-500/' }, { label: '\uD83D\uDD25 \u00A31000 Build', href: '/guides/gaming-setup-1000/' }, { label: '\uD83D\uDC8E \u00A32500 Build', href: '/guides/gaming-setup-2500/' }],
    drops:    [{ label: '\u26A1 Latest Picks', href: '/comparisons/' }, { label: '\u2696\uFE0F Mouse Showdown', href: '/comparisons/logitech-superlight-2-vs-razer-viper-v3-pro/' }, { label: '\uD83D\uDDA5\uFE0F Monitor Battle', href: '/comparisons/asus-pg27aqdp-vs-pg32ucdm/' }, { label: '\uD83E\uDE91 Chair Face-Off', href: '/comparisons/secretlab-titan-evo-vs-herman-miller-aeron/' }],
    profile:  [{ label: '\u2139\uFE0F About StackPick', href: '/about/' }, { label: '\uD83D\uDD0D Search', href: '/search/' }],
  };
  var RACK_TITLES = { browse: 'Quick Browse', loadouts: 'Setup Guides', drops: 'New Drops', profile: 'More' };
  function buildRackHTML(tab) {
    var items = RACK_CONTENT[tab] || [], title = RACK_TITLES[tab] || tab;
    var h = '<p style="font-family:var(--font-display);font-size:1.1rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-tertiary);margin-bottom:var(--sp-3);">' + title + '</p>';
    return h + '<div class="rack-sheet__content">' + items.map(function (it) { return '<a href="' + it.href + '" class="rack-sheet__link-item"><span>' + it.label + '</span><span class="rack-sheet__link-arrow">\u2192</span></a>'; }).join('') + '</div>';
  }
  function initRack() {
    _rackSheet = document.getElementById('rack-sheet'); _rackOverlay = document.getElementById('rack-sheet-overlay');
    var boxes = document.querySelectorAll('.rack-box'), holdTimer = null;
    boxes.forEach(function (box) {
      var tab = box.dataset.tab;
      box.addEventListener('click', function () { clearTimeout(holdTimer); boxes.forEach(function (b) { b.classList.toggle('rack-box--active', b === box); b.setAttribute('aria-pressed', b === box ? 'true' : 'false'); }); });
      box.addEventListener('pointerdown', function () {
        box.setAttribute('data-holding', 'true');
        holdTimer = setTimeout(function () {
          box.removeAttribute('data-holding'); box.classList.add('rack-box--lifted');
          var content = document.getElementById('rack-sheet-content'); if (content) content.innerHTML = buildRackHTML(tab);
          if (_rackSheet) { _rackSheet.classList.add('rack-sheet--open'); _rackSheet.setAttribute('aria-hidden', 'false'); }
          if (_rackOverlay) { _rackOverlay.classList.add('open'); _rackOverlay.setAttribute('aria-hidden', 'false'); }
          setTimeout(function () { box.classList.remove('rack-box--lifted'); }, 400);
        }, 400);
      });
      box.addEventListener('pointerup',    function () { clearTimeout(holdTimer); box.removeAttribute('data-holding'); });
      box.addEventListener('pointerleave', function () { clearTimeout(holdTimer); box.removeAttribute('data-holding'); });
      box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); box.click(); } });
    });
    if (_rackOverlay) _rackOverlay.addEventListener('click', closeRackSheet);
  }


  /* 04  CARD BUILDER UTILITIES */

  function escapeHTML(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function buildSpecs(specs) { return (specs || []).map(function (s) { return '<span class="spec-pill">' + escapeHTML(s) + '</span>'; }).join(''); }
  function buildStamps(product) {
    var out = '<span class="stamp stamp--uk-stock">\uD83C\uDDEC\uD83C\uDDE7 UK Stock</span>';
    if (product.nextDay) out += '<span class="stamp stamp--next-day">\u26A1 Next Day</span>';
    return out;
  }
  function buildLoadoutDots(count) {
    var MAX = 5, n = Math.min(Math.max(count || 0, 0), MAX), dots = '';
    for (var i = 0; i < MAX; i++) dots += '<span class="loadout-dot' + (i < n ? ' loadout-dot--filled' : '') + '" aria-hidden="true"></span>';
    return '<div class="box-card__loadout-dots" aria-label="Featured in ' + n + ' loadout' + (n !== 1 ? 's' : '') + '">' + dots + '</div>';
  }
  function buildDrawerStats(product) {
    var rows = '';
    (product.pros || []).forEach(function (pro, i) { rows += '<div class="drawer-stat"><span class="drawer-stat__key">' + (i === 0 ? 'Pros' : '') + '</span><span class="drawer-stat__val">\u2713\u00A0' + escapeHTML(pro) + '</span></div>'; });
    (product.cons || []).forEach(function (con) { rows += '<div class="drawer-stat drawer-stat--con"><span class="drawer-stat__key">Watch</span><span class="drawer-stat__val">\u2715\u00A0' + escapeHTML(con) + '</span></div>'; });
    return rows;
  }
  function buildAltPicks(product) {
    if (!window.SP_PRODUCTS) return '';
    var alts = window.SP_PRODUCTS.filter(function (p) { return p.category === product.category && p.id !== product.id; }).slice(0, 3);
    if (!alts.length) return '<li style="color:var(--text-tertiary);font-size:var(--text-sm);padding:var(--sp-3);">More picks coming soon.</li>';
    return alts.map(function (alt) { return '<li class="alt-pick"><span class="alt-pick__name">' + escapeHTML(alt.shortName) + '</span><span class="alt-pick__price">' + escapeHTML(alt.price) + '</span><a class="alt-pick__link" href="' + alt.affiliate + '" target="_blank" rel="noopener sponsored" aria-label="View ' + escapeHTML(alt.name) + ' on Amazon UK">\u2192</a></li>'; }).join('');
  }

  function buildCard(product, index, animDelay) {
    var seam = SEAM_COLOURS[product.category] || '#8E8EA0';
    var glow = SEAM_GLOWS[product.category]   || 'rgba(142,142,160,0.15)';
    var offsetClass = index % 2 === 0 ? 'box-card--offset-right' : 'box-card--offset-left';
    var article = document.createElement('article');
    article.className = 'box-card ' + offsetClass + ' box-card--entering';
    article.dataset.id = product.id; article.dataset.category = product.category;
    article.style.cssText = '--cat-seam:' + seam + ';--cat-glow:' + glow + ';';
    if (animDelay > 0) article.style.animationDelay = animDelay + 'ms';
    article.setAttribute('role', 'listitem');
    article.setAttribute('aria-label', escapeHTML(product.name) + ' \u2014 ' + escapeHTML(product.price));
    article.setAttribute('tabindex', '0');
    article.innerHTML = [
      '<div class="box-card__shadow-layer" aria-hidden="true"></div>',
      '<div class="box-card__body">',
        '<div class="box-card__front">',
          '<div class="box-card__seam" aria-hidden="true"></div>',
          '<div class="box-card__lip" aria-hidden="true"></div>',
          '<div class="box-card__img-zone">',
            '<div class="box-card__img box-card__img--' + product.category + '" aria-hidden="true">',
              '<span style="font-size:64px;filter:drop-shadow(0 0 16px ' + seam + '88);">' + product.emoji + '</span>',
            '</div>',
            '<span class="box-card__category-tag">' + escapeHTML(product.category) + '</span>',
          '</div>',
          '<div class="box-card__info">',
            '<span class="box-card__badge">' + escapeHTML(product.badge) + '</span>',
            '<h2 class="box-card__name">' + escapeHTML(product.name) + '</h2>',
            '<div class="box-card__specs">' + buildSpecs(product.specs) + '</div>',
          '</div>',
          '<div class="box-card__footer">',
            '<div class="box-card__badges-row">' + buildStamps(product) + '</div>',
            buildLoadoutDots(product.loadoutCount),
          '</div>',
          '<div class="box-card__drawer" aria-hidden="true">',
            '<div class="box-card__drawer-specs">' + buildDrawerStats(product) + '</div>',
            '<div class="box-card__drawer-price">',
              '<span class="box-card__price">' + escapeHTML(product.price) + '</span>',
              '<a class="box-card__cta" href="' + product.affiliate + '" target="_blank" rel="noopener sponsored" aria-label="View ' + escapeHTML(product.name) + ' on Amazon UK">View on Amazon \u2192</a>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="box-card__back" aria-hidden="true">',
          '<p class="box-card__back-label">Similar picks</p>',
          '<ul class="box-card__alt-list">' + buildAltPicks(product) + '</ul>',
        '</div>',
      '</div>',
      '<button class="box-card__flip-btn" aria-label="Flip for similar picks" tabindex="0">\u21BA</button>',
    ].join('');

    var front  = article.querySelector('.box-card__front');
    var drawer = article.querySelector('.box-card__drawer');
    var flip   = article.querySelector('.box-card__flip-btn');
    var back   = article.querySelector('.box-card__back');

    front.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) return;
      var expanded = article.classList.toggle('box-card--expanded');
      drawer.setAttribute('aria-hidden', expanded ? 'false' : 'true');
      if (typeof gtag === 'function') gtag('event', 'card_expand', { product_id: product.id, product_name: product.name, category: product.category, expanded: expanded });
    });

    /* 6E: card_flip — added flip_direction named dimension */
    flip.addEventListener('click', function (e) {
      e.stopPropagation();
      var flipped = article.classList.toggle('box-card--flipped');
      back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
      flip.setAttribute('aria-label', flipped ? 'Flip back to product' : 'Flip for similar picks');
      if (typeof gtag === 'function') gtag('event', 'card_flip', {
        product_id:     product.id,
        product_name:   product.name,
        flip_direction: flipped ? 'reveal' : 'reset',
      });
    });

    article.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); front.click(); } });
    article.addEventListener('animationend', function () { article.classList.remove('box-card--entering'); }, { once: true });
    return article;
  }


  /* 05  PATCH BUILDER */

  var _longPressTimer = null, _longPressTarget = null;

  function buildPatch(collection, isActive) {
    var btn = document.createElement('button');
    btn.className = 'patch' + (isActive ? ' patch--active' : '');
    btn.dataset.collection = collection.id;
    btn.style.setProperty('--patch-color', collection.color);
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.setAttribute('aria-label', collection.label + ' collection');
    btn.setAttribute('type', 'button');
    btn.innerHTML =
      '<span class="patch__ring" aria-hidden="true"></span>'
    + '<span class="patch__ring patch__ring--inner" aria-hidden="true"></span>'
    + '<span class="patch__emoji" aria-hidden="true">' + collection.emoji + '</span>'
    + '<span class="patch__label">' + escapeHTML(collection.label) + '</span>'
    + '<span class="patch__active-dot" aria-hidden="true"></span>';
    return btn;
  }

  function wirePatch(patchEl, col, preview, previewCards, previewCta) {
    patchEl.addEventListener('click', function () {
      clearTimeout(_longPressTimer);
      if (preview) { preview.classList.remove('patch-preview--open'); preview.setAttribute('aria-hidden', 'true'); }
      if (col.id === state.activeCollectionId) return;
      switchCollection(col.id);
      if (typeof gtag === 'function') gtag('event', 'patch_tap', { collection_id: col.id, collection_label: col.label });
    });

    patchEl.addEventListener('pointerdown', function () {
      _longPressTarget = col.id;
      _longPressTimer = setTimeout(function () {

        /* 6E: GA4 patch_long_press fires at the 350ms mark */
        if (typeof gtag === 'function') gtag('event', 'patch_long_press', {
          collection_id:    col.id,
          collection_label: col.label,
        });

        if (!preview || !previewCards) return;
        var products = window.SP_getCollectionProducts ? SP_getCollectionProducts(col.id).slice(0, 3) : [];
        var previewHeader = document.getElementById('patch-preview-header');
        if (previewHeader) {
          previewHeader.innerHTML = '<span class="patch-preview__collection-emoji">' + col.emoji + '</span> <span>' + escapeHTML(col.label) + '</span>';
        }
        previewCards.innerHTML = products.map(function (p) {
          var seam = SEAM_COLOURS[p.category] || '#8E8EA0';
          return '<div class="patch-preview__mini-card" style="--mini-seam:' + seam + ';"><span class="patch-preview__mini-emoji">' + p.emoji + '</span><span class="patch-preview__mini-name">' + escapeHTML(p.shortName) + '</span><span class="patch-preview__mini-price">' + escapeHTML(p.price) + '</span></div>';
        }).join('');
        preview.classList.add('patch-preview--open');
        preview.setAttribute('aria-hidden', 'false');
      }, 350);
    });

    patchEl.addEventListener('pointerup',    function () { clearTimeout(_longPressTimer); });
    patchEl.addEventListener('pointerleave', function () { clearTimeout(_longPressTimer); });
    patchEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); patchEl.click(); } });

    if (previewCta && !previewCta._wired) {
      previewCta._wired = true;
      previewCta.addEventListener('click', function () {
        if (_longPressTarget) switchCollection(_longPressTarget);
        if (preview) { preview.classList.remove('patch-preview--open'); preview.setAttribute('aria-hidden', 'true'); }
      });
    }
  }

  function renderPatches() {
    if (!window.SP_COLLECTIONS) return;
    var storyTrack = document.getElementById('story-track');
    var railTrack  = document.getElementById('patch-rail-track');
    var preview    = document.getElementById('patch-preview');
    var previewCards = document.getElementById('patch-preview-cards');
    var previewCta   = document.getElementById('patch-preview-cta');
    window.SP_COLLECTIONS.forEach(function (col) {
      var isActive = col.id === state.activeCollectionId;
      if (storyTrack) { var sp = buildPatch(col, isActive); wirePatch(sp, col, preview, previewCards, previewCta); storyTrack.appendChild(sp); }
      if (railTrack)  { var rp = buildPatch(col, isActive); wirePatch(rp, col, preview, previewCards, previewCta); railTrack.appendChild(rp); }
    });
    setTimeout(function () {
      var ap = storyTrack && storyTrack.querySelector('.patch--active');
      if (ap) ap.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    }, 120);
  }

  function updatePatchActiveStates(collectionId) {
    document.querySelectorAll('.patch').forEach(function (p) {
      var a = p.dataset.collection === collectionId;
      p.classList.toggle('patch--active', a);
      p.setAttribute('aria-pressed', a ? 'true' : 'false');
    });
    html.setAttribute('data-collection', collectionId);
    html.setAttribute('data-shuffle-step', '0');
  }


  /* 06  WALL RENDERER */

  function sortProducts(products, mode) {
    var arr = products.slice();
    if (mode === 'price-asc')  return arr.sort(function (a, b) { return a.priceRaw - b.priceRaw; });
    if (mode === 'price-desc') return arr.sort(function (a, b) { return b.priceRaw - a.priceRaw; });
    if (mode === 'popular')    return arr.sort(function (a, b) { return (b.loadoutCount || 0) - (a.loadoutCount || 0); });
    return arr;
  }

  function renderCollection(products) {
    var stack = document.getElementById('card-stack');
    if (!stack) return;
    var shimmer = document.getElementById('card-stack-loading');
    if (shimmer) shimmer.remove();
    stack.innerHTML = '';
    if (!products || !products.length) {
      stack.innerHTML = '<p style="color:var(--text-tertiary);padding:var(--sp-8) var(--sp-4);font-family:var(--font-mono);font-size:var(--text-sm);text-align:center;">No picks in this collection yet.</p>';
      return;
    }
    var sorted = sortProducts(products, state.sortMode);
    var frag   = document.createDocumentFragment();
    sorted.forEach(function (product, i) {
      var delay = i < CARD_ENTER_LIMIT ? i * CARD_STAGGER_MS : CARD_ENTER_LIMIT * CARD_STAGGER_MS;
      frag.appendChild(buildCard(product, i, delay));
      if ((i + 1) % CLUSTER_EVERY === 0 && i < sorted.length - 1) {
        var cluster = buildLoadoutCluster(sorted.slice(Math.max(0, i - CLUSTER_EVERY + 1), i + 1));
        cluster.style.animationDelay = (delay + CARD_STAGGER_MS) + 'ms';
        frag.appendChild(cluster);
      }
    });
    stack.appendChild(frag);
    updateWallHeader(state.activeCollectionId, sorted.length);
  }


  /* 07  COLLECTION SWITCHER */

  function switchCollection(collectionId) {
    if (state.isTransitioning) return;
    if (!window.SP_getCollection) return;
    var col = SP_getCollection(collectionId);
    if (!col) return;
    state.isTransitioning = true; state.shuffleStep = 0; state.activeCollectionId = collectionId;
    hideSufflesBanner(); html.classList.add('wall-body--transitioning');
    var stack = document.getElementById('card-stack');
    if (stack) {
      stack.style.transition = 'opacity ' + TRANSITION_OUT_MS + 'ms ease, transform ' + TRANSITION_OUT_MS + 'ms ease';
      stack.style.opacity = '0'; stack.style.transform = 'translateY(8px) scaleY(0.98)';
    }
    setTimeout(function () {
      if (stack) { stack.style.transition = ''; stack.style.opacity = ''; stack.style.transform = ''; }
      var products = SP_getCollectionProducts(collectionId);
      renderCollection(products); updatePatchActiveStates(collectionId);
      updateWallHeader(collectionId, products.length); closeSortMenu();
      var wall = document.getElementById('wall');
      if (wall) wall.scrollIntoView({ behavior: 'smooth', block: 'start' });
      html.classList.remove('wall-body--transitioning'); state.isTransitioning = false;
    }, TRANSITION_OUT_MS);
  }

  function updateWallHeader(collectionId, count) {
    var col = window.SP_getCollection ? SP_getCollection(collectionId) : null;
    var emojiEl = document.getElementById('wall-collection-emoji');
    var labelEl = document.getElementById('wall-collection-label');
    var countEl = document.getElementById('wall-count');
    if (emojiEl && col) emojiEl.textContent = col.emoji;
    if (labelEl && col) labelEl.textContent = col.label.toUpperCase();
    if (countEl) countEl.textContent = count + (count === 1 ? ' item' : ' items');
  }


  /* 08  LOADOUT CLUSTER BUILDER */

  function buildLoadoutCluster(products) {
    if (!products || !products.length) return document.createElement('div');
    var display = products.slice(0, 3);
    var total   = products.reduce(function (s, p) { return s + (p.priceRaw || 0); }, 0);
    var totalFmt = '\u00A3' + Math.round(total);
    var col   = state.activeCollectionId && window.SP_getCollection ? SP_getCollection(state.activeCollectionId) : null;
    var title = col ? col.label + ' \u2014 ' + display.map(function (p) { return p.category; }).join(' \u00B7 ') : 'Featured Picks';
    var section = document.createElement('section');
    section.className = 'loadout-cluster box-card--entering';
    section.setAttribute('aria-label', title + ' loadout');
    var miniBoxes = display.map(function (p, i) {
      var seam = SEAM_COLOURS[p.category] || '#8E8EA0';
      return '<div class="loadout-cluster__mini-box loadout-cluster__mini-box--' + (i + 1) + '" style="border-right:2px solid ' + seam + ';"><span class="mini-box__silhouette">' + p.emoji + '</span></div>';
    }).join('');
    section.innerHTML = '<div class="loadout-cluster__stack">' + miniBoxes + '</div><div class="loadout-cluster__meta"><h3 class="loadout-cluster__title">' + escapeHTML(title) + '</h3><span class="loadout-cluster__items">' + products.length + ' items in range</span><span class="loadout-cluster__total">' + escapeHTML(totalFmt) + ' combined</span><a class="loadout-cluster__cta" href="/guides/">See Setup Guides \u2192</a></div>';
    section.addEventListener('animationend', function () { section.classList.remove('box-card--entering'); }, { once: true });
    return section;
  }


  /* 09  SORT MENU */

  function closeSortMenu() {
    var menu = document.getElementById('wall-sort-menu'), sortBtn = document.getElementById('wall-sort');
    if (!menu) return;
    menu.setAttribute('aria-hidden', 'true');
    if (sortBtn) sortBtn.setAttribute('aria-expanded', 'false');
  }

  function initSortMenu() {
    var sortBtn = document.getElementById('wall-sort'), menu = document.getElementById('wall-sort-menu');
    if (!sortBtn || !menu) return;
    sortBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.getAttribute('aria-hidden') === 'false';
      menu.setAttribute('aria-hidden', open ? 'true' : 'false');
      sortBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    menu.querySelectorAll('.wall__sort-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        state.sortMode = opt.dataset.sort || 'default';
        menu.querySelectorAll('.wall__sort-option').forEach(function (o) { o.classList.toggle('wall__sort-option--active', o === opt); o.setAttribute('aria-selected', o === opt ? 'true' : 'false'); });
        closeSortMenu();
        var products = state.shuffleStep > 0 ? SP_getShuffleVariant(state.activeCollectionId, state.shuffleStep - 1) : SP_getCollectionProducts(state.activeCollectionId);
        renderCollection(products);
      });
    });
    document.addEventListener('click', function (e) { if (menu && !menu.contains(e.target) && e.target !== sortBtn) closeSortMenu(); });
  }


  /* 10  SCROLL — parallax shadow + patch jiggle
   *
   * 6E PARALLAX FIX:
   * The .box-card__shadow-layer sits inside the card and travels
   * with it 1:1 during scroll. We push it DOWN by (scrollY × SHADOW_LAG)
   * so its world-position only moves (1 - SHADOW_LAG) × scrollY.
   * Net visual: shadow lags 12% behind the card — light source appears fixed.
   * Previous code used 0.04 which moved shadow WITH the scroll direction,
   * the opposite of a fixed light source illusion.
   */

  function initScroll() {
    var ticking  = false;
    var JIGGLE_T = 300;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      window.requestAnimationFrame(function () {
        var scrollY = window.scrollY;

        /* 6E: corrected parallax — shadow lags behind card */
        var shadowOffset = scrollY * SHADOW_LAG;
        document.querySelectorAll('.box-card__shadow-layer').forEach(function (l) {
          l.style.transform = 'translateY(' + shadowOffset + 'px)';
        });

        if (scrollY > state.jiggleScrollY + JIGGLE_T) {
          state.jiggleScrollY = scrollY;
          document.querySelectorAll('.patch--active').forEach(function (p) {
            p.classList.remove('patch--jiggle');
            void p.offsetWidth;
            p.classList.add('patch--jiggle');
            setTimeout(function () { p.classList.remove('patch--jiggle'); }, 650);
          });
        }
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }


  /* 11  PULL-TO-SHUFFLE */

  function initPullToShuffle() {
    var trigger = document.getElementById('shuffle-trigger');
    var stack   = document.getElementById('card-stack');
    if (!trigger || !stack) return;
    var lastHapticDelta = 0;

    document.addEventListener('touchstart', function (e) {
      if (window.scrollY > 2) return;
      if (e.target.closest('a, button, input, .prefs-sheet, .rack-sheet')) return;
      state.pull.active = true; state.pull.startY = e.touches[0].clientY;
      state.pull.currentDelta = 0; state.pull.triggered = false; lastHapticDelta = 0;
      stack.style.perspective = '1200px'; stack.style.transformOrigin = '50% 0%'; stack.style.transition = 'none';
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
      if (!state.pull.active) return;
      var rawDelta = e.touches[0].clientY - state.pull.startY;
      if (rawDelta <= 0) { _resetPullVisuals(stack, trigger); state.pull.active = false; return; }
      var resistDelta = rawDelta < PULL_MAX ? rawDelta * PULL_RESIST : (PULL_MAX * PULL_RESIST) + (rawDelta - PULL_MAX) * (PULL_RESIST * 0.15);
      state.pull.currentDelta = rawDelta;
      if (rawDelta > PULL_SHOW_AT) {
        trigger.classList.add('shuffle-trigger--pulling');
        var progress = Math.min(rawDelta / PULL_TRIGGER, 1);
        stack.style.transform = 'translateY(' + resistDelta + 'px) rotateX(' + (progress * 4) + 'deg) scaleY(' + (1 - progress * 0.03) + ')';
        _updateTriggerProgress(trigger, progress);
        if (rawDelta - lastHapticDelta > 60 && !state.pull.triggered) { if (navigator.vibrate) navigator.vibrate(HAPTIC_PULL_TICK); lastHapticDelta = rawDelta; }
      }
      if (rawDelta >= PULL_TRIGGER && !state.pull.triggered) {
        state.pull.triggered = true;
        trigger.classList.add('shuffle-trigger--armed');
        if (navigator.vibrate) navigator.vibrate(HAPTIC_TRIGGERED);
        document.querySelectorAll('.patch--active').forEach(function (p) { p.classList.add('patch--charged'); });
      }
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      if (!state.pull.active) return;
      var finalDelta = state.pull.currentDelta; state.pull.active = false;
      document.querySelectorAll('.patch--charged').forEach(function (p) { p.classList.remove('patch--charged'); });
      if (finalDelta >= PULL_TRIGGER) { triggerShuffle(stack, trigger); } else { _snapBack(stack, trigger); }
    }, { passive: true });

    document.addEventListener('touchcancel', function () {
      if (!state.pull.active) return; state.pull.active = false;
      document.querySelectorAll('.patch--charged').forEach(function (p) { p.classList.remove('patch--charged'); });
      _snapBack(stack, trigger);
    }, { passive: true });
  }

  function _updateTriggerProgress(trigger, progress) {
    /* SVG arc: r=18, circumference = 2π×18 ≈ 113.1 (matches HTML stroke-dasharray) */
    var arc = trigger.querySelector('.shuffle-trigger__arc');
    if (!arc) return;
    arc.style.strokeDashoffset = (113.1 * (1 - progress)).toFixed(2);
  }

  function _resetPullVisuals(stack, trigger) {
    stack.style.transition = ''; stack.style.transform = ''; stack.style.perspective = ''; stack.style.transformOrigin = '';
    trigger.classList.remove('shuffle-trigger--pulling', 'shuffle-trigger--armed');
    var arc = trigger.querySelector('.shuffle-trigger__arc');
    if (arc) arc.style.strokeDashoffset = '113.1';
  }

  function _snapBack(stack, trigger) {
    stack.style.transition = 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease';
    stack.style.transform = ''; stack.style.opacity = '';
    setTimeout(function () { stack.style.transition = ''; stack.style.perspective = ''; stack.style.transformOrigin = ''; }, 460);
    trigger.classList.remove('shuffle-trigger--pulling', 'shuffle-trigger--armed');
    var arc = trigger.querySelector('.shuffle-trigger__arc');
    if (arc) {
      arc.style.transition = 'stroke-dashoffset 300ms ease';
      arc.style.strokeDashoffset = '113.1';
      setTimeout(function () { arc.style.transition = ''; }, 320);
    }
  }

  function triggerShuffle(stack, trigger) {
    if (state.isShuffle) return;
    var col = window.SP_getCollection ? SP_getCollection(state.activeCollectionId) : null;
    if (!col || !col.shuffleVariants || !col.shuffleVariants.length) {
      if (navigator.vibrate) navigator.vibrate(HAPTIC_NO_VARIANT);
      document.querySelectorAll('.patch--active').forEach(function (p) {
        p.classList.remove('patch--jiggle'); void p.offsetWidth; p.classList.add('patch--jiggle');
        setTimeout(function () { p.classList.remove('patch--jiggle'); }, 650);
      });
      if (!stack) stack = document.getElementById('card-stack');
      if (!trigger) trigger = document.getElementById('shuffle-trigger');
      _snapBack(stack, trigger); return;
    }
    if (!stack) stack = document.getElementById('card-stack');
    if (!trigger) trigger = document.getElementById('shuffle-trigger');
    state.isShuffle = true; state.isTransitioning = true;
    var totalV = col.shuffleVariants.length;
    state.shuffleStep = (state.shuffleStep % totalV) + 1;
    html.setAttribute('data-shuffle-step', state.shuffleStep);
    var variant  = col.shuffleVariants[state.shuffleStep - 1];
    var products = SP_getShuffleVariant(state.activeCollectionId, state.shuffleStep - 1);

    /* 6E: GA4 shuffle_trigger event */
    if (typeof gtag === 'function') gtag('event', 'shuffle_trigger', {
      trigger_method:   'pull',
      collection_id:    state.activeCollectionId,
      collection_label: col.label,
      shuffle_step:     state.shuffleStep,
      wall_item_count:  products.length,
    });

    if (navigator.vibrate) navigator.vibrate(HAPTIC_SHUFFLE);
    var cards = stack.querySelectorAll('.box-card, .loadout-cluster');
    var cardArr = Array.prototype.slice.call(cards);
    stack.style.perspective = '1400px'; stack.style.transformOrigin = '50% 0%'; stack.style.transition = 'none'; stack.style.transform = '';
    cardArr.forEach(function (card, i) {
      var d = Math.min(i, 8) * FLIP_STAGGER_MS;
      card.style.transformOrigin = '50% 0%';
      card.style.transition = 'transform ' + FLIP_COMPRESS_MS + 'ms cubic-bezier(0.55,0,0.45,1) ' + d + 'ms,opacity ' + FLIP_COMPRESS_MS + 'ms ease ' + d + 'ms';
      card.style.transform = 'rotateX(90deg) scaleY(0.6)'; card.style.opacity = '0';
    });
    var phaseOneDuration = FLIP_COMPRESS_MS + Math.min(cardArr.length - 1, 8) * FLIP_STAGGER_MS + FLIP_HOLD_MS;

    setTimeout(function () {
      /* 6E: overshoot on patches at the "deal" moment (more theatrical than jiggle) */
      document.querySelectorAll('.patch--active').forEach(function (p) {
        p.classList.remove('patch--jiggle', 'patch--overshoot');
        void p.offsetWidth;
        p.classList.add('patch--overshoot');
        setTimeout(function () { p.classList.remove('patch--overshoot'); }, 700);
      });

      renderCollection(products);
      var newCards = stack.querySelectorAll('.box-card, .loadout-cluster');
      var newArr = Array.prototype.slice.call(newCards);
      newArr.forEach(function (card) {
        card.style.transition = 'none'; card.style.transformOrigin = '50% 0%';
        card.style.transform = 'rotateX(-70deg) scaleY(0.7) translateY(-16px)'; card.style.opacity = '0';
      });
      void stack.offsetWidth;
      newArr.forEach(function (card, i) {
        var d = Math.min(i, 10) * FLIP_STAGGER_MS;
        card.style.transition = 'transform ' + FLIP_EXPAND_MS + 'ms cubic-bezier(0.16,1,0.3,1) ' + d + 'ms,opacity 200ms ease ' + d + 'ms';
        card.style.transform = ''; card.style.opacity = '';
      });
      var totalExpandMs = FLIP_EXPAND_MS + Math.min(newArr.length - 1, 10) * FLIP_STAGGER_MS + 80;
      setTimeout(function () {
        newArr.forEach(function (card) { card.style.transition = ''; card.style.transform = ''; card.style.opacity = ''; card.style.transformOrigin = ''; });
        stack.style.perspective = ''; stack.style.transformOrigin = '';
        state.isShuffle = false; state.isTransitioning = false;
      }, totalExpandMs);
      showShuffleBanner(col.label + ' \u2014 ' + (variant.label || 'v' + state.shuffleStep), state.shuffleStep, col.shuffleVariants.length);
    }, phaseOneDuration);

    trigger.classList.remove('shuffle-trigger--pulling', 'shuffle-trigger--armed');
    var arc = trigger.querySelector('.shuffle-trigger__arc');
    if (arc) arc.style.strokeDashoffset = '113.1';
  }


  /* 12  SHUFFLE BANNER */

  var _shuffleTimer = null, _bannerVisible = false;

  function showShuffleBanner(text, step, totalSteps) {
    var banner = document.getElementById('shuffle-banner'), label = document.getElementById('shuffle-banner-text');
    var diceEl = document.getElementById('shuffle-banner-dice'), dotsEl = document.getElementById('shuffle-banner-dots');
    if (!banner) return;
    clearTimeout(_shuffleTimer);
    if (label) label.textContent = text;
    if (diceEl) { diceEl.classList.remove('shuffle-banner__dice--spin'); void diceEl.offsetWidth; diceEl.classList.add('shuffle-banner__dice--spin'); }
    if (dotsEl && step != null && totalSteps != null) {
      var dotHTML = '';
      for (var d = 0; d <= totalSteps; d++) {
        var isCurrent = (d === 0 && step === 0) || (d > 0 && d === step);
        dotHTML += '<span class="shuffle-banner__dot' + (isCurrent ? ' shuffle-banner__dot--active' : '') + '" aria-hidden="true"></span>';
      }
      dotsEl.innerHTML = dotHTML;
      dotsEl.setAttribute('aria-label', 'Variant ' + step + ' of ' + totalSteps);
    }
    if (!_bannerVisible) {
      banner.style.transition = 'none'; banner.style.opacity = '0'; banner.style.transform = 'translateY(16px) scale(0.96)';
      void banner.offsetWidth;
      banner.classList.add('shuffle-banner--visible'); banner.style.transition = ''; banner.style.opacity = ''; banner.style.transform = '';
      _bannerVisible = true;
    } else {
      banner.classList.add('shuffle-banner--pulse');
      setTimeout(function () { banner.classList.remove('shuffle-banner--pulse'); }, 300);
    }
    _shuffleTimer = setTimeout(hideSufflesBanner, 3000);
  }

  function hideSufflesBanner() {
    var banner = document.getElementById('shuffle-banner');
    if (!banner) return;
    clearTimeout(_shuffleTimer);
    banner.classList.remove('shuffle-banner--visible');
    setTimeout(function () { _bannerVisible = false; }, 400);
  }

  function initShuffleBanner() {
    var btn = document.getElementById('shuffle-reset');
    if (!btn) return;
    btn.addEventListener('click', function () {
      state.shuffleStep = 0; html.setAttribute('data-shuffle-step', '0');
      hideSufflesBanner(); renderCollection(SP_getCollectionProducts(state.activeCollectionId));
    });
    var banner = document.getElementById('shuffle-banner');
    if (banner) { banner.addEventListener('click', function (e) { if (!e.target.closest('button')) hideSufflesBanner(); }); }
  }


  /* 13  SERVICE WORKER */

  function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          reg.update();
          reg.addEventListener('updatefound', function () {
            var nw = reg.installing; if (!nw) return;
            nw.addEventListener('statechange', function () {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) nw.postMessage({ type: 'SKIP_WAITING' });
            });
          });
        }).catch(function (err) { console.warn('[SP] SW failed:', err); });
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () { if (!refreshing) { refreshing = true; window.location.reload(); } });
    });
  }


  /* 14  PWA BANNER */

  function initPWABanner() {
    var KEY = 'sp-pwa-dismissed', deferred = null;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
    function show() {
      try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
      var s = document.createElement('style');
      s.textContent = '#sp-pwa{position:fixed;bottom:calc(var(--utility-rack-h)+8px);left:0;right:0;z-index:var(--z-banner);padding:0 1rem;pointer-events:none;}@media(min-width:768px){#sp-pwa{bottom:1rem;max-width:480px;left:50%;transform:translateX(-50%);}}.sp-pwa-i{background:var(--surface-lift);border:1px solid var(--border-strong);border-radius:12px;padding:.85rem 1rem;display:flex;align-items:center;gap:.75rem;box-shadow:var(--shadow-card);pointer-events:all;}.sp-pwa-t{flex:1;font-size:.875rem;line-height:1.4;color:var(--text-primary);font-family:var(--font-body);}.sp-pwa-a{display:flex;gap:.5rem;align-items:center;flex-shrink:0;}.sp-pwa-btn{background:var(--volt);color:var(--volt-text);border:none;border-radius:8px;padding:.45rem .9rem;font-size:.75rem;font-weight:800;cursor:pointer;font-family:var(--font-display);letter-spacing:.06em;text-transform:uppercase;}.sp-pwa-x{background:transparent;color:var(--text-tertiary);border:none;cursor:pointer;font-size:1rem;padding:.25rem .5rem;}';
      document.head.appendChild(s);
      var b = document.createElement('div'); b.id = 'sp-pwa';
      b.innerHTML = '<div class="sp-pwa-i"><div class="sp-pwa-t"><span>\u26A1</span> <span id="sp-pwa-m">Install <strong>StackPick</strong> \u2014 works offline too.</span></div><div class="sp-pwa-a"><button class="sp-pwa-btn">Install</button><button class="sp-pwa-x" aria-label="Dismiss">\u2715</button></div></div>';
      b.querySelector('.sp-pwa-x').addEventListener('click', function () { b.remove(); try { sessionStorage.setItem(KEY,'1'); } catch(e){} });
      b.querySelector('.sp-pwa-btn').addEventListener('click', function () {
        if (deferred) { deferred.prompt(); deferred.userChoice.then(function (r) { if (typeof gtag === 'function') gtag('event','pwa_install_prompt',{outcome:r.outcome}); deferred=null; b.remove(); }); }
        else { var m = document.getElementById('sp-pwa-m'); if (m) m.innerHTML = 'Tap <strong>Share</strong> then <strong>Add to Home Screen</strong>.'; b.querySelector('.sp-pwa-btn').style.display = 'none'; }
      });
      document.body.appendChild(b);
      b.style.cssText += ';opacity:0;transform:translateY(16px);transition:opacity .3s,transform .3s;';
      requestAnimationFrame(function () { requestAnimationFrame(function () { b.style.opacity='1'; b.style.transform='translateY(0)'; }); });
    }
    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred=e; setTimeout(show,30000); });
    var isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent), isSafari=/^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari) setTimeout(show,30000);
  }


  /* 15  INIT */

  function init() {
    if (!window.SP_PRODUCTS || !window.SP_COLLECTIONS) {
      console.error('[SP] Data files not loaded.');
      var stack = document.getElementById('card-stack');
      if (stack) stack.innerHTML = '<p style="color:var(--text-tertiary);padding:var(--sp-8);font-family:var(--font-mono);font-size:var(--text-sm);">Could not load product data.</p>';
      return;
    }
    initPrefsSheet(); initRack(); renderPatches();
    var products = SP_getCollectionProducts(state.activeCollectionId);
    renderCollection(products); updateWallHeader(state.activeCollectionId, products.length);
    initSortMenu(); initScroll(); initPullToShuffle(); initShuffleBanner(); initServiceWorker(); initPWABanner();
    console.log('%c\u26A1 StackPick%c 6E \u2014 ' + SP_PRODUCTS.length + ' products, ' + SP_COLLECTIONS.length + ' collections loaded', 'color:#C8FF00;font-weight:800;font-family:monospace;font-size:13px;', 'color:#8E8EA0;font-family:monospace;font-size:13px;');
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

})();
