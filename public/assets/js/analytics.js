// ============================================================
//  STACK PICK — analytics.js  v7
//  GA4 property: G-ZTN7H3L6DV  (preserved verbatim — do not alter)
//
//  Loads on every page — must be the FIRST script tag.
//  Exposes window.gtag globally so app.js and wall.js can fire
//  events without null-checking the script tag themselves.
//
//  PRIVACY:
//    IP anonymisation on · Google signals off · Ad personalisation off

//  CONTENTS
//  01  dataLayer bootstrap & gtag shim
//  02  GA4 config
//  03  Page view
//  04  Scroll depth milestones (25 / 50 / 75 / 100 %)
//  05  Outbound click tracking (affiliate select_item + outbound_click)
//  06  File download tracking
//  07  Site search query tracking
//  08  JavaScript error tracking
//  09  Unhandled promise rejection tracking
//  10  Page performance timing (LCP + load event fallback)
// ============================================================

(function () {
    'use strict';


    // ============================================================
    //  01  DATALAYER BOOTSTRAP & GTAG SHIM
    // ============================================================

    window.dataLayer = window.dataLayer || [];

    function gtag() {
        window.dataLayer.push(arguments);
    }

    window.gtag = gtag;
    gtag('js', new Date());


    // ============================================================
    //  02  GA4 CONFIG
    //
    //  Property:  G-ZTN7H3L6DV
    // ============================================================

    gtag('config', 'G-ZTN7H3L6DV', {
        allow_google_signals:             false,
        allow_ad_personalization_signals: false,
        cookie_flags:                     'SameSite=None;Secure',
        send_page_view:                   false,
    });


    // ============================================================
    //  03  PAGE VIEW
    // ============================================================

    gtag('event', 'page_view', {
        page_title:    document.title,
        page_location: window.location.href,
        page_path:     window.location.pathname,
    });


    // ============================================================
    //  04  SCROLL DEPTH MILESTONES
    //
    //  FIX: Added { passive: true } to the scroll event listener.
    //  Without this, the browser had to pause scroll to call this
    //  handler — causing measurable jank, especially on mobile.
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
                    gtag('event', 'scroll_depth', {
                        percent_scrolled: milestone,
                        page_path:        window.location.pathname,
                    });
                }
            });

            _scrollTicking = false;
        });
    }, { passive: true }); // ← FIX: passive listener — does not block scroll thread


   
// ============================================================
    //  05  OUTBOUND CLICK TRACKING (AFFILIATE + GENERAL)
    // ============================================================

    document.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el.tagName !== 'A') { el = el.parentNode; }
        if (!el || !el.href) return;

        var href = el.href;
        var text = (el.textContent || '').trim().slice(0, 100);
        var page = window.location.pathname;

        // ── 05a  Amazon affiliate — GA4 ecommerce only ────────

        if (href.includes('amzn.to') || href.includes('amazon.co.uk')) {
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
            return; // do not also fire outbound_click for Amazon links
        }

        // ── 05b  General outbound ─────────────────────────────

        if (el.hostname && el.hostname !== window.location.hostname) {
            gtag('event', 'outbound_click', {
                link_url:    href,
                link_domain: el.hostname,
            });
        }
    });


    // ============================================================
    //  06  FILE DOWNLOAD TRACKING
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
    });


    // ============================================================
    //  07  SITE SEARCH QUERY TRACKING
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
                // LCP entry type not supported — fall through to load event fallback
            }
        }

        // ── 10b  Load event fallback ──────────────────────────

        window.addEventListener('load', function () {
            var timing = window.performance && window.performance.timing;
            if (!timing) return;

            var loadMs = timing.loadEventEnd - timing.navigationStart;
            if (loadMs <= 0) return;

            gtag('event', 'page_load_ms', {
                value:     loadMs,
                page_path: window.location.pathname,
            });
        });
    }());

}());
