// ============================================================
//  STACKPICK V2 — app.js
//  Shared controller for all inner pages.
//  Homepage uses wall.js instead.
//
//  Requires: theme.js (sync, in <head>), shared.js (defer, before this)
//
//  CONTENTS
//  01  Theme
//  02  Bottom nav active state        [via shared.js]
//  03  More panel                     [via shared.js]
//  04  Affiliate click tracking       [via shared.js]
//  05  Search (search page only)      [BUG FIX: now uses SP_SEARCH_INDEX]
//  06  Init
// ============================================================

(function() {
    'use strict';
    
    
    // ============================================================
    //  01  THEME
    //  theme.js exposes window.SP_initTheme — call it to wire
    //  all theme toggle buttons on this page.
    // ============================================================
    
    if (typeof window.SP_initTheme === 'function') {
        window.SP_initTheme();
    }
    
    
    // ============================================================
    //  02  BOTTOM NAV ACTIVE STATE  [shared.js]
    // ============================================================
    
    if (window.SP_shared) {
        window.SP_shared.initBottomNav();
    }
    
    
    // ============================================================
    //  03  MORE PANEL  [shared.js]
    // ============================================================
    
    if (window.SP_shared) {
        window.SP_shared.initMorePanel(
            document.getElementById('more-btn'),
            document.getElementById('more-panel'),
            document.getElementById('more-overlay')
        );
    }
    
    
    // ============================================================
    //  04  AFFILIATE CLICK TRACKING  [shared.js]
    //  Inner pages don't have an active collection so no extra params.
    // ============================================================
    
    if (window.SP_shared) {
        window.SP_shared.initAffiliateTracking();
    }
    
    
    // ============================================================
    //  05  SEARCH  (search/index.html only)
    //
    //  BUG FIX: The previous version read window.SP_PRODUCTS and
    //  filtered by raw product fields (.brand, .category, etc.).
    //  The search page actually loads search-index.js which exports
    //  window.SP_SEARCH_INDEX — a flat array of {type, icon, title,
    //  desc, price, url, tags} entries for ALL content types
    //  (products, comparisons, guides).
    //
    //  This version filters SP_SEARCH_INDEX by the pre-built .tags
    //  string, which already contains all searchable text and is
    //  the format the search-index.js export was designed for.
    // ============================================================
    
    var searchInput = document.getElementById('search-input');
    var searchBtn = document.getElementById('search-btn');
    var searchResults = document.getElementById('search-results');
    var resultsCount = document.getElementById('results-count');
    
    if (searchInput && searchBtn && searchResults) {
        
        // SP_SEARCH_INDEX is loaded by search/index.html via search-index.js.
        // Each entry: { type, icon, title, desc, price, url, tags }
        var INDEX = window.SP_SEARCH_INDEX || [];
        
        function doSearch(query) {
            query = (query || '').trim().toLowerCase();
            
            if (!query) {
                searchResults.innerHTML = '';
                if (resultsCount) resultsCount.textContent = '';
                return;
            }
            
            // Filter against the pre-built tags string (contains name, brand,
            // category, specs, pros, cons, metaDescription, etc.)
            var results = INDEX.filter(function(entry) {
                return (
                    (entry.tags || '').includes(query) ||
                    (entry.title || '').toLowerCase().includes(query) ||
                    (entry.desc || '').toLowerCase().includes(query)
                );
            });
            
            if (resultsCount) {
                resultsCount.textContent =
                    results.length + ' result' + (results.length !== 1 ? 's' : '') +
                    ' for "' + escHtml(query) + '"';
            }
            
            if (!results.length) {
                searchResults.innerHTML =
                    '<div class="card-grid__empty">' +
                    '<div class="empty-state-glow"></div>' +
                    '<p>SCAN FAILURE: No matches found in this sector.</p>' +
                    '</div>';
                return;
            }
            
            searchResults.innerHTML = results.map(function(entry) {
                var titleHl = highlight(escHtml(entry.title), query);
                var descHl = highlight(escHtml((entry.desc || '').substring(0, 120) + '\u2026'), query);
                var priceEl = entry.price ?
                    '<span class="product-card__price">' + escHtml(entry.price) + '</span>' :
                    '';
                
                return (
                    '<article class="product-card product-card--search">' +
                    '<div class="product-card__visual">' +
                    '<div class="product-card__icon-wrap"><span class="product-card__emoji">' + (entry.icon || '\uD83D\uDCE6') + '</span></div>' +
                    '<span class="stamp stamp--stock">' + escHtml(entry.type) + '</span>' +
                    '</div>' +
                    '<div class="product-card__body">' +
                    '<h3 class="product-card__name">' + titleHl + '</h3>' +
                    '<p class="product-card__desc" style="font-size:13px;color:var(--color-text-muted);margin-top:8px;">' + descHl + '</p>' +
                    '</div>' +
                    '<div class="product-card__footer">' +
                    priceEl +
                    '<a href="' + escAttr(entry.url) + '" class="btn-primary">' +
                    'View \u2192' +
                    '</a>' +
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
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') doSearch(searchInput.value);
        });
        
        // Pre-fill from URL ?q= param
        var q = new URLSearchParams(window.location.search).get('q');
        if (q) { searchInput.value = q;
            doSearch(q); }
    }
    
    
    // ============================================================
    //  06  INIT
    // ============================================================
    
    function init() {
        // All init happens on listener attachment above.
        // Hook point retained for future per-page setup.
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
    
    function escAttr(str) { return String(str || '').replace(/"/g, '&quot;'); }
    
}());