// ============================================================
//  STACKPICK V2 — shared.js
//  Shared browser utilities extracted from app.js and wall.js.
//
//  Previously duplicated verbatim in both files:
//    - More panel (isMoreOpen / openMore / closeMore)
//    - Bottom nav active state
//    - Affiliate click tracking
//
//  Exposes: window.SP_shared
//
//  Load order: must be included BEFORE app.js and wall.js.
//  In HTML: <script src="/assets/js/shared.js" defer></script>
//  (theme.js is synchronous and must still load first — no change there)
// ============================================================

(function () {
  'use strict';


  // ============================================================
  //  MORE PANEL
  //  Returns a controller object for a given set of panel DOM refs.
  //  Both app.js (inner pages) and wall.js (homepage) call this
  //  with their respective #more-btn / #more-panel / #more-overlay refs.
  // ============================================================

  /**
   * @param {HTMLElement} moreBtn
   * @param {HTMLElement} morePanel
   * @param {HTMLElement} moreOverlay
   * @returns {{ open, close }}
   */
  function initMorePanel(moreBtn, morePanel, moreOverlay) {
    if (!moreBtn || !morePanel || !moreOverlay) return { open: noop, close: noop };

    function isOpen() {
      return morePanel.getAttribute('aria-hidden') === 'false';
    }

    function openMore() {
      morePanel.setAttribute('aria-hidden',   'false');
      moreOverlay.setAttribute('aria-hidden', 'false');
      moreOverlay.classList.add('open');
      moreBtn.setAttribute('aria-expanded', 'true');
      // Focus first interactive element inside the panel
      var first = morePanel.querySelector('a, button');
      if (first) first.focus();
    }

    function closeMore() {
      morePanel.setAttribute('aria-hidden',   'true');
      moreOverlay.setAttribute('aria-hidden', 'true');
      moreOverlay.classList.remove('open');
      moreBtn.setAttribute('aria-expanded', 'false');
      moreBtn.focus();
    }

    // Toggle on button click
    moreBtn.addEventListener('click', function () {
      isOpen() ? closeMore() : openMore();
    });

    // Close on overlay click
    moreOverlay.addEventListener('click', closeMore);

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) closeMore();
    });

    return { open: openMore, close: closeMore };
  }


  // ============================================================
  //  BOTTOM NAV ACTIVE STATE
  //  Marks the nav link whose data-nav-path matches the current URL.
  // ============================================================

  function initBottomNav() {
    var normPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.bottom-nav__link[data-nav-path]').forEach(function (link) {
      var lp = (link.getAttribute('data-nav-path') || '').replace(/\/$/, '') || '/';
      if (lp === normPath) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }


  // ============================================================
  //  AFFILIATE CLICK TRACKING
  //
  //  Fires a GA4 affiliate_click event on any click that reaches
  //  an Amazon link. Extra params (e.g. collection) can be passed
  //  by the caller for page-specific context.
  //
  //  @param {function} [getExtraParams]
  //    Optional function called at click time that returns an object
  //    of additional gtag event params (e.g. { collection: activeId }).
  // ============================================================

  function initAffiliateTracking(getExtraParams) {
    document.addEventListener('click', function (e) {
      var el = e.target;
      while (el && el.tagName !== 'A') { el = el.parentElement; }
      if (!el || !el.href) return;

      var isAffiliate = el.href.includes('amzn.to') || el.href.includes('amazon.co.uk');
      var productId   = el.getAttribute('data-product') || '';
      var type        = el.getAttribute('data-type')    || 'link';

      if (isAffiliate && typeof window.gtag === 'function') {
        var params = {
          link_url:   el.href,
          product_id: productId,
          click_type: type,
          page_path:  window.location.pathname,
        };

        // Merge in any extra params supplied by the calling page (e.g. collection)
        if (typeof getExtraParams === 'function') {
          var extra = getExtraParams();
          if (extra && typeof extra === 'object') {
            Object.keys(extra).forEach(function (k) { params[k] = extra[k]; });
          }
        }

        window.gtag('event', 'affiliate_click', params);
      }
    });
  }


  // ============================================================
  //  UTILS
  // ============================================================

  function noop() {}


  // ============================================================
  //  EXPORT
  // ============================================================

  window.SP_shared = {
    initMorePanel:        initMorePanel,
    initBottomNav:        initBottomNav,
    initAffiliateTracking: initAffiliateTracking,
  };

}());
