// ============================================================
//  STACK PICK — analytics.js  v6
//  GA4 property: G-ZTN7H3L6DV  (preserved verbatim — do not alter)
//
//  Loads on every page — must be the FIRST script tag.
//  Exposes window.gtag globally so app.js and wall.js can fire
//  events without null-checking the script tag themselves.
//
//  PRIVACY:
//    IP anonymisation on · Google signals off · Ad personalisation off
//    Cookies: SameSite=None;Secure
//
//  CONTENTS
//  01  dataLayer bootstrap & gtag shim
//  02  GA4 config
//  03  Page view
//  04  Scroll depth milestones (25 / 50 / 75 / 100 %)
//  05  Affiliate & outbound click tracking
//  06  File download tracking
//  07  Site search query tracking
//  08  JavaScript error tracking
//  09  Unhandled promise rejection tracking
//  10  Page performance timing (LCP proxy via load event)
// ============================================================

(function () {
    'use strict';


    // ============================================================
    //  01  DATALAYER BOOTSTRAP & GTAG SHIM
    //
    //  Standard Google tag shim.  Must run synchronously so that
    //  subsequent gtag() calls in this file don't throw before
    //  the GA4 script tag (loaded async in <head>) drains the queue.
    // ============================================================

    window.dataLayer = window.dataLayer || [];

    function gtag() {
        window.dataLayer.push(arguments);
    }

    // Expose globally — app.js, wall.js, and inline snippets all use window.gtag
    window.gtag = gtag;

    gtag('js', new Date());


    // ============================================================
    //  02  GA4 CONFIG
    //
    //  Property:  G-ZTN7H3L6DV
    //  Settings intentionally limit data collection to comply with
    //  UK GDPR / ICO guidance for analytics-only (no ad) use.
    // ============================================================

    gtag('config', 'G-ZTN7H3L6DV', {
        anonymize_ip:                       true,   // IPv4 last octet masked
        allow_google_signals:               false,  // no remarketing audiences
        allow_ad_personalization_signals:   false,  // no ad personalisation
        cookie_flags:                       'SameSite=None;Secure',
        // Disable automatic page_view — we fire it manually in section 03
        // so we control the timing and can include custom dimensions.
        send_page_view:                     false,
    });


    // ============================================================
    //  03  PAGE VIEW
    //
    //  Fired once on script load (covers both hard navigations and
    //  the initial load of SPA-style pages).
    //  wall.js does not re-fire this on collection switches — those
    //  are tracked as patch_tap / shuffle_trigger events instead.
    // ============================================================

    gtag('event', 'page_view', {
        page_title:    document.title,
        page_location: window.location.href,
        page_path:     window.location.pathname,
    });


    // ============================================================
    //  04  SCROLL DEPTH MILESTONES
    //
    //  Fires once per milestone per page load: 25 / 50 / 75 / 100 %.
    //  Uses requestAnimationFrame to avoid blocking the scroll thread.
    //  Guarded against division-by-zero on short pages.
    // ============================================================

    var _scrollTracked = { 25: false, 50: false, 75: false, 100: false };
    var _scrollTicking = false;

    window.addEventListener('scroll', function () {
        if (_scrollTicking) return;
        _scrollTicking = true;

        window.requestAnimationFrame(function () {
            var scrollable = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollable <= 0) { _scrollTicking = false; return; }

            var pct = Math.round((window.scrollY / scrollable) * 100);

            [25, 50, 75, 100].forEach(function (milestone) {
                if (pct >= milestone && !_scrollTracked[milestone]) {
                    _scrollTracked[milestone] = true;
                    gtag('event', 'scroll', {
                        percent_scrolled: milestone,    // GA4 native dimension
                        page_path:        window.location.pathname,
                    });
                }
            });

            _scrollTicking = false;
        });
    }, { passive: true });


    // ============================================================
    //  05  AFFILIATE & OUTBOUND CLICK TRACKING
    //
    //  Event schema — must match app.js section 05 and wall.js:
    //
    //  Amazon affiliate links fire TWO events intentionally:
    //    select_item     — GA4 ecommerce standard (for revenue reporting)
    //    affiliate_click — simple named event (for GA4 goal funnels)
    //
    //  Other external links fire:
    //    outbound_click  — matches app.js schema (link_url, link_domain)
    //
    //  After an affiliate click we return early so the same link
    //  cannot also fire outbound_click.
    // ============================================================

    document.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el.tagName !== 'A') { el = el.parentNode; }
        if (!el || !el.href) return;

        var href = el.href;
        var text = (el.textContent || '').trim().slice(0, 100);
        var page = window.location.pathname;

        // ── 05a  Amazon affiliate ─────────────────────────────

        if (href.includes('amzn.to') || href.includes('amazon.co.uk')) {
            // GA4 ecommerce — powers revenue attribution reports
            gtag('event', 'select_item', {
                item_list_name: page,
                items: [{
                    item_name:     text || href,
                    item_category: 'affiliate',
                    item_brand:    'Amazon UK',
                    affiliation:   'Amazon Associates',
                    link_url:      href,
                }],
            });

            // Simple named event — used for GA4 goal setup
            gtag('event', 'affiliate_click', {
                link_url:  href,
                link_text: text,
                page_path: page,
            });

            return; // prevent double-fire as outbound
        }

        // ── 05b  General outbound ─────────────────────────────

        if (el.hostname && el.hostname !== window.location.hostname) {
            gtag('event', 'outbound_click', {
                link_url:    href,
                link_domain: el.hostname,
            });
        }

    }, { passive: true });


    // ============================================================
    //  06  FILE DOWNLOAD TRACKING
    //
    //  Fires when a link href ends with a known download extension.
    //  Handled in a separate listener so it fires independently of
    //  section 05 (a PDF hosted on amazon.co.uk would trigger both,
    //  which is correct — affiliate click + download).
    // ============================================================

    var DOWNLOAD_EXTS = ['pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'mp3'];

    document.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el.tagName !== 'A') { el = el.parentNode; }
        if (!el || !el.href) return;

        var href = el.href;
        var ext  = href.split('?')[0].split('.').pop().toLowerCase();

        if (DOWNLOAD_EXTS.includes(ext)) {
            gtag('event', 'file_download', {
                file_extension: ext,
                file_name:      href.split('/').pop().split('?')[0],
                link_url:       href,
                page_path:      window.location.pathname,
            });
        }
    }, { passive: true });


    // ============================================================
    //  07  SITE SEARCH QUERY TRACKING
    //
    //  Reads ?q= from the URL on page load — covers /search/ and
    //  any future search result pages that use the same parameter.
    //  GA4 also auto-detects search terms if you configure the
    //  query parameter in Admin → Data Streams → Enhanced Measurement,
    //  but this manual event adds page_path context.
    // ============================================================

    (function () {
        if (!window.location.search.includes('q=')) return;
        var searchQuery = new URLSearchParams(window.location.search).get('q');
        if (!searchQuery) return;

        gtag('event', 'search', {
            search_term: searchQuery.trim().slice(0, 200),
            page_path:   window.location.pathname,
        });
    }());


    // ============================================================
    //  08  JAVASCRIPT ERROR TRACKING
    //
    //  Catches uncaught errors site-wide and logs them as GA4
    //  exceptions.  fatal: false — an error doesn't mean the session
    //  is unrecoverable, just that something went wrong.
    //  Truncated to 150 chars to stay within GA4 string limits.
    // ============================================================

    window.addEventListener('error', function (e) {
        var desc = (e.message || 'Unknown error') +
                   ' at ' + (e.filename || 'unknown') +
                   ':' + (e.lineno || 0);

        gtag('event', 'exception', {
            description: desc.slice(0, 150),
            fatal:       false,
        });
    });


    // ============================================================
    //  09  UNHANDLED PROMISE REJECTION TRACKING
    //
    //  Catches Promise rejections not caught by .catch() — common
    //  source of silent failures in async code (fetch errors, etc).
    //  Not supported in IE11 but that's not a target browser.
    // ============================================================

    window.addEventListener('unhandledrejection', function (e) {
        var reason = e.reason
            ? (e.reason.message || String(e.reason)).slice(0, 150)
            : 'Unhandled promise rejection';

        gtag('event', 'exception', {
            description: 'Promise rejection: ' + reason,
            fatal:       false,
        });
    });


    // ============================================================
    //  10  PAGE PERFORMANCE TIMING
    //
    //  Fires once after the page load event with a proxy for
    //  Largest Contentful Paint — the window load time in ms.
    //  For real LCP use the PerformanceObserver below; this acts
    //  as a reliable fallback for browsers that don't support it.
    //
    //  Custom GA4 metric: page_load_ms (integer, milliseconds)
    // ============================================================

    (function () {
        // ── 10a  PerformanceObserver LCP (modern browsers) ────

        if (typeof PerformanceObserver !== 'undefined') {
            try {
                var lcpObserver = new PerformanceObserver(function (list) {
                    var entries = list.getEntries();
                    if (!entries.length) return;
                    var lcp = entries[entries.length - 1];
                    gtag('event', 'lcp', {
                        value:     Math.round(lcp.startTime),
                        page_path: window.location.pathname,
                    });
                    lcpObserver.disconnect();
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (err) {
                // PerformanceObserver exists but LCP entry type not supported — fall through
            }
        }

        // ── 10b  Load event fallback ──────────────────────────

        window.addEventListener('load', function () {
            var timing = window.performance && window.performance.timing;
            if (!timing) return;

            // navigationStart → loadEventEnd gives total page load time
            var loadMs = timing.loadEventEnd - timing.navigationStart;
            if (loadMs <= 0) return;

            gtag('event', 'page_load_ms', {
                value:     loadMs,
                page_path: window.location.pathname,
            });
        });
    }());

}());
