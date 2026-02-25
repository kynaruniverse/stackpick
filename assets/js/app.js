// ============================================================
//  STACKPICK V2 — app.js
//  Shared controller for all inner pages.
//  Homepage uses wall.js instead.
//
//  CONTENTS
//  01  Theme
//  02  Bottom nav active state
//  03  More panel
//  04  Affiliate click tracking
//  05  Search (search page only)
//  06  Init
// ============================================================

(function() {
    'use strict';
    
    
    // ============================================================
    //  01  THEME
    // ============================================================
    
    if (typeof window.SP_initTheme === 'function') {
        window.SP_initTheme();
    } else {
        // Fallback if theme.js hasn't loaded yet
        (function() {
            try {
                var saved = localStorage.getItem('sp-theme');
                if (saved) document.documentElement.setAttribute('data-theme', saved);
                else if (window.matchMedia('(prefers-color-scheme: light)').matches)
                    document.documentElement.setAttribute('data-theme', 'light');
            } catch (e) {}
        })();
    }
    
    // Theme toggle buttons (header + sidebar)
    var themeToggleIds = ['theme-toggle', 'theme-toggle-sidebar'];
    themeToggleIds.forEach(function(id) {
        var btn = document.getElementById(id);
        if (!btn) return;
        
        function syncBtn() {
            var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            btn.textContent = isDark ? '🌙' : '☀️';
        }
        
        syncBtn();
        
        btn.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('sp-theme', next); } catch (e) {}
            syncBtn();
        });
    });
    
    
    // ============================================================
    //  02  BOTTOM NAV ACTIVE STATE
    // ============================================================
    
    var normPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.bottom-nav__link[data-nav-path]').forEach(function(link) {
        var lp = (link.getAttribute('data-nav-path') || '').replace(/\/$/, '') || '/';
        if (lp === normPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
    
    
    // ============================================================
    //  03  MORE PANEL
    // ============================================================
    
    var moreBtn = document.getElementById('more-btn');
    var morePanel = document.getElementById('more-panel');
    var moreOverlay = document.getElementById('more-overlay');
    
    function isMoreOpen() {
        return morePanel && morePanel.getAttribute('aria-hidden') === 'false';
    }
    
    function openMore() {
        if (!morePanel || !moreOverlay || !moreBtn) return;
        morePanel.setAttribute('aria-hidden', 'false');
        moreOverlay.setAttribute('aria-hidden', 'false');
        moreOverlay.classList.add('open');
        moreBtn.setAttribute('aria-expanded', 'true');
        var first = morePanel.querySelector('a, button');
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
    
    if (moreBtn) moreBtn.addEventListener('click', function() { isMoreOpen() ? closeMore() : openMore(); });
    if (moreOverlay) moreOverlay.addEventListener('click', closeMore);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMoreOpen()) closeMore();
    });
    
    
    // ============================================================
    //  04  AFFILIATE CLICK TRACKING
    // ============================================================
    
    document.addEventListener('click', function(e) {
        var el = e.target;
        while (el && el.tagName !== 'A') { el = el.parentElement; }
        if (!el || !el.href) return;
        
        var isAffiliate = el.href.includes('amzn.to') || el.href.includes('amazon.co.uk');
        var productId = el.getAttribute('data-product') || '';
        var type = el.getAttribute('data-type') || 'link';
        
        if (isAffiliate && typeof gtag === 'function') {
            gtag('event', 'affiliate_click', {
                link_url: el.href,
                product_id: productId,
                click_type: type,
                page_path: window.location.pathname,
            });
        }
    });
    
    
    // ============================================================
    //  05  SEARCH (search page only)
    // ============================================================
    
    var searchInput = document.getElementById('search-input');
    var searchBtn = document.getElementById('search-btn');
    var searchResults = document.getElementById('search-results');
    var resultsCount = document.getElementById('results-count');
    
    if (searchInput && searchBtn && searchResults) {
        var SP_PRODUCTS = window.SP_PRODUCTS || [];
        
        function doSearch(query) {
            query = (query || '').trim().toLowerCase();
            
            if (!query) {
                searchResults.innerHTML = '';
                if (resultsCount) resultsCount.textContent = '';
                return;
            }
            
            var results = SP_PRODUCTS.filter(function(p) {
                return (
                    p.name.toLowerCase().includes(query) ||
                    p.brand.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query) ||
                    (p.desc || '').toLowerCase().includes(query) ||
                    (p.tags || []).some(function(t) { return t.toLowerCase().includes(query); })
                );
            });
            
            if (resultsCount) {
                resultsCount.textContent = results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for "' + escHtml(query) + '"';
            }
            
            if (!results.length) {
                searchResults.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--body-font-size-sm);">No picks found for that search. Try a broader term.</p>';
                return;
            }
            
            searchResults.innerHTML = results.map(function(p) {
                var nameHl = highlight(escHtml(p.name), query);
                var descHl = highlight(escHtml((p.desc || '').substring(0, 120) + '…'), query);
                return (
                    '<article class="product-entry">' +
                    '<div class="product-entry__rank">' +
                    '<span class="rank-badge">' + escHtml(p.category) + '</span>' +
                    '</div>' +
                    '<div class="product-entry__body">' +
                    '<h3 class="product-entry__name">' + nameHl + '</h3>' +
                    '<p class="product-entry__desc">' + descHl + '</p>' +
                    '<div class="product-entry__footer">' +
                    '<div class="price-block"><span class="price-current">' + escHtml(p.price) + '</span></div>' +
                    '<a href="' + escAttr(p.affiliate) + '" class="btn-primary"' +
                    ' target="_blank" rel="noopener sponsored"' +
                    ' data-product="' + escAttr(p.id) + '" data-type="search-cta">' +
                    'View on Amazon →' +
                    '</a>' +
                    '</div>' +
                    '</div>' +
                    '</article>'
                );
            }).join('');
        }
        
        function highlight(text, query) {
            if (!query) return text;
            var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            return text.replace(re, '<mark class="search-highlight">$1</mark>');
        }
        
        searchBtn.addEventListener('click', function() { doSearch(searchInput.value); });
        searchInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') doSearch(searchInput.value); });
        
        // Pre-fill from URL param
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) { searchInput.value = q;
            doSearch(q); }
    }
    
    
    // ============================================================
    //  06  INIT
    // ============================================================
    
    function init() {
        // Nothing further needed — all init happens on listener attachment above
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    
    // ── Utils ──
    
    function escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    
    function escAttr(str) { return String(str || '').replace(/"/g, '&quot;'); }
    
}());