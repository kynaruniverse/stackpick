(function () {
    'use strict';

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());

    const GA4_ID = 'G-ZTN7H3L6DV';

    gtag('config', GA4_ID, {
        allow_google_signals:             false,
        allow_ad_personalization_signals: false,
        cookie_flags:                     'SameSite=None;Secure',
        send_page_view:                   false,
    });

    gtag('event', 'page_view', {
        page_title:    document.title,
        page_location: window.location.href,
        page_path:     window.location.pathname,
    });

    let _scrollTracked = { 25: false, 50: false, 75: false, 100: false };
    let _scrollTicking = false;

    window.addEventListener('scroll', function () {
        if (_scrollTicking) return;
        _scrollTicking = true;

        window.requestAnimationFrame(function () {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollable <= 0) { _scrollTicking = false; return; }

            const pct = Math.round((window.scrollY / scrollable) * 100);

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
    }, { passive: true });

    document.addEventListener('click', function (e) {
        let el = e.target;
        while (el && el.tagName !== 'A') { el = el.parentNode; }
        if (!el || !el.href) return;

        const href = el.href;
        const text = (el.textContent || '').trim().slice(0, 100);
        const page = window.location.pathname;

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
            return;
        }

        if (el.hostname && el.hostname !== window.location.hostname) {
            gtag('event', 'outbound_click', {
                link_url:    href,
                link_domain: el.hostname,
            });
        }
    });

    const DOWNLOAD_EXTS = ['pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'mp3'];
    document.addEventListener('click', function (e) {
        let el = e.target;
        while (el && el.tagName !== 'A') { el = el.parentNode; }
        if (!el || !el.href) return;

        const href = el.href;
        const ext  = href.split('?')[0].split('.').pop().toLowerCase();

        if (DOWNLOAD_EXTS.includes(ext)) {
            gtag('event', 'file_download', {
                file_extension: ext,
                file_name:      href.split('/').pop().split('?')[0],
                link_url:       href,
                page_path:      window.location.pathname,
            });
        }
    });

    (function () {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        if (!searchQuery) return;

        gtag('event', 'search', {
            search_term: searchQuery.trim().slice(0, 200),
            page_path:   window.location.pathname,
        });
    }());

    window.addEventListener('error', function (e) {
        const desc = (e.message || 'Unknown error') + ' at ' + (e.filename || 'unknown') + ':' + (e.lineno || 0);
        gtag('event', 'exception', { description: desc.slice(0, 150), fatal: false });
    });

    window.addEventListener('unhandledrejection', function (e) {
        const reason = e.reason ? (e.reason.message || String(e.reason)).slice(0, 150) : 'Unhandled promise rejection';
        gtag('event', 'exception', { description: 'Promise rejection: ' + reason, fatal: false });
    });

    (function () {
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                const lcpObserver = new PerformanceObserver(function (list) {
                    const entries = list.getEntries();
                    if (!entries.length) return;
                    const lcp = entries[entries.length - 1];
                    gtag('event', 'lcp', { value: Math.round(lcp.startTime), page_path: window.location.pathname });
                    lcpObserver.disconnect();
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            } catch (err) {}
        }

        window.addEventListener('load', function () {
            const timing = window.performance && window.performance.timing;
            if (!timing) return;
            const loadMs = timing.loadEventEnd - timing.navigationStart;
            if (loadMs > 0) {
                gtag('event', 'page_load_ms', { value: loadMs, page_path: window.location.pathname });
            }
        });
    }());
}());
