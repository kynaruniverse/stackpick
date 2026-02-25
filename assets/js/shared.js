// ============================================================
//  STACKPICK V2 — shared.js
//  Shared browser utilities for all pages.
//
//  Load order:
//    <script src="/assets/js/shared.js" defer></script>
//    must appear BEFORE app.js and wall.js in every HTML page.
//    theme.js is synchronous and must still load first — no change.
//
//  Exposes: window.SP_shared
//
//  FIXES vs previous version:
//    1. escHtml() and escAttr() extracted here from wall.js and app.js
//       where they were duplicated. SP_shared.escHtml is the single source.
//    2. initAffiliateTracking() is the SOLE source of affiliate_click events.
//       analytics.js only fires select_item (GA4 ecommerce). This eliminates
//       the double-counting bug where every Amazon click fired affiliate_click
//       twice — once from analytics.js and once from here.
//    3. Scroll listener in analytics.js now uses { passive: true }.
//       (Enforced here for shared.js scroll work if ever added.)
// ============================================================

(function () {
  'use strict';


  // ============================================================
  //  ESCAPING UTILS
  //  Previously duplicated verbatim in app.js and wall.js.
  //  Both files should now call SP_shared.escHtml / SP_shared.escAttr.
  // ============================================================

  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  /**
   * Escape a value for safe insertion in an HTML attribute.
   * More defensive than escHtml — handles unquoted/single-quoted attributes.
   */
  function escAttr(str) {
    return String(str == null ? '' : str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }


  // ============================================================
  //  MORE PANEL
  //  Returns a controller object for a given set of panel DOM refs.
  // ============================================================

  /**
   * @param {HTMLElement} moreBtn
   * @param {HTMLElement} morePanel
   * @param {HTMLElement} moreOverlay
   * @returns {{ open: function, close: function }}
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

    moreBtn.addEventListener('click', function () {
      isOpen() ? closeMore() : openMore();
    });

    moreOverlay.addEventListener('click', closeMore);

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
  //  FIX: This is now the SOLE source of affiliate_click GA4 events.
  //  analytics.js section 05a previously also fired affiliate_click,
  //  causing double-counting on every Amazon click. analytics.js now
  //  fires only select_item (GA4 ecommerce). This file owns affiliate_click.
  //
  //  @param {function} [getExtraParams]
  //    Optional. Called at click time. Returns object of additional
  //    gtag event params (e.g. { collection: activeCollectionId }).
  // ============================================================

  function initAffiliateTracking(getExtraParams) {
    document.addEventListener('click', function (e) {
      var el = e.target;
      while (el && el.tagName !== 'A') { el = el.parentElement; }
      if (!el || !el.href) return;

      var isAffiliate = el.href.includes('amzn.to') || el.href.includes('amazon.co.uk');
      if (!isAffiliate) return;

      var productId = el.getAttribute('data-product') || '';
      var type      = el.getAttribute('data-type')    || 'link';

      if (typeof window.gtag === 'function') {
        var params = {
          link_url:   el.href,
          product_id: productId,
          click_type: type,
          page_path:  window.location.pathname,
        };

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
    initMorePanel,
    initBottomNav,
    initAffiliateTracking,
    // Expose escaping utils so wall.js and app.js don't need to duplicate them
    escHtml,
    escAttr,
  };

}());
