// ============================================================
//  STACK PICK — app.js  v6
//  Phase 6F — Category pages, guides, comparisons, search, about.
//  NOT loaded on index.html (wall.js handles the homepage).
//
//  DEPENDS ON:
//    analytics.js  — must load before this (GA4 gtag global)
//    style.css     — design tokens for category pages
//
//  CONTENTS
//  01  Theme — detection, apply, persist, system-sync
//  02  Prefs sheet — open/close/overlay/keyboard
//  03  Nav active states — rack-box + prefs-sheet links
//  04  Smooth scroll — anchor links
//  05  Affiliate & outbound click tracking (GA4)
//  06  PWA install prompt — volt-themed banner
// ============================================================

(function () {
    'use strict';


    // ============================================================
    //  01  THEME
    //
    //  Detection priority: saved localStorage → system preference.
    //  The icon lives inside a <span class="theme-toggle__icon">
    //  child of the button — we update the span, not textContent.
    //  Also updates the desktop patch-rail theme button if present.
    // ============================================================

    var html        = document.documentElement;
    var themeToggle = document.getElementById('theme-toggle');

    // ── 01a  Helpers ──────────────────────────────────────────

    function getSystemTheme() {
        return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? 'dark'
            : 'light';
    }

    function getSavedTheme() {
        try { return localStorage.getItem('sp-theme'); }
        catch (e) { return null; }
    }

    function saveTheme(theme) {
        try { localStorage.setItem('sp-theme', theme); }
        catch (e) { /* private browsing — silent fail */ }
    }

    // ── 01b  Apply & sync all theme buttons ──────────────────

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        _syncThemeButtons(theme);
    }

    function _syncThemeButtons(theme) {
        var isDark = theme === 'dark';
        var icon   = isDark ? '☀️' : '🌙';
        var label  = isDark ? 'Switch to light mode' : 'Switch to dark mode';

        // Mobile header toggle
        if (themeToggle) {
            var iconSpan = themeToggle.querySelector('.theme-toggle__icon');
            if (iconSpan) {
                iconSpan.textContent = icon;
            } else {
                themeToggle.textContent = icon;
            }
            themeToggle.setAttribute('aria-label', label);
        }

        // Desktop patch-rail theme button (category pages share the same rail HTML)
        var railThemeBtn = document.querySelector('.patch-rail__theme-btn');
        if (railThemeBtn) {
            var railIcon = railThemeBtn.querySelector('.patch-rail__theme-icon');
            if (railIcon) {
                railIcon.textContent = icon;
            } else {
                railThemeBtn.textContent = icon;
            }
            railThemeBtn.setAttribute('aria-label', label);
        }

        // Prefs sheet theme value label
        var prefThemeVal = document.getElementById('pref-theme-val');
        if (prefThemeVal) {
            prefThemeVal.textContent = isDark ? 'Dark' : 'Light';
        }
    }

    function toggleTheme() {
        var current = html.getAttribute('data-theme') || 'light';
        var next    = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        saveTheme(next);
    }

    // ── 01c  Initialise ───────────────────────────────────────

    applyTheme(getSavedTheme() || getSystemTheme());

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Desktop patch-rail theme button (delegation)
    document.addEventListener('click', function (e) {
        if (e.target.closest('.patch-rail__theme-btn')) {
            toggleTheme();
        }
    });

    // Sidebar theme button (#theme-toggle-sidebar)
    var sidebarThemeBtn = document.getElementById('theme-toggle-sidebar');
    if (sidebarThemeBtn) {
        sidebarThemeBtn.addEventListener('click', toggleTheme);
    }

    // Follow OS preference only when user has no saved preference
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!getSavedTheme()) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }


    // ============================================================
    //  02  PREFS SHEET
    //
    //  Wires: #guest-chip (open) · #prefs-close (close) ·
    //         #prefs-overlay (backdrop click)
    //  Keyboard: Escape closes · moves focus to first focusable on open ·
    //            returns focus to trigger on close.
    // ============================================================

    var guestChip    = document.getElementById('guest-chip');
    var prefsSheet   = document.getElementById('prefs-sheet');
    var prefsClose   = document.getElementById('prefs-close');
    var prefsOverlay = document.getElementById('prefs-overlay');

    // ── 02a  State helpers ────────────────────────────────────

    function isPrefsOpen() {
        return prefsSheet && prefsSheet.classList.contains('prefs-sheet--open');
    }

    function openPrefs() {
        if (!prefsSheet || !prefsOverlay || !guestChip) return;
        prefsSheet.classList.add('prefs-sheet--open');
        prefsOverlay.classList.add('open');
        guestChip.setAttribute('aria-expanded', 'true');
        prefsSheet.setAttribute('aria-hidden', 'false');
        prefsOverlay.setAttribute('aria-hidden', 'false');
        var firstFocusable = prefsSheet.querySelector('button, a, [tabindex="0"]');
        if (firstFocusable) firstFocusable.focus();
    }

    function closePrefs() {
        if (!prefsSheet || !prefsOverlay || !guestChip) return;
        prefsSheet.classList.remove('prefs-sheet--open');
        prefsOverlay.classList.remove('open');
        guestChip.setAttribute('aria-expanded', 'false');
        prefsSheet.setAttribute('aria-hidden', 'true');
        prefsOverlay.setAttribute('aria-hidden', 'true');
        guestChip.focus();
    }

    // ── 02b  Wire events ──────────────────────────────────────

    if (guestChip) {
        guestChip.addEventListener('click', function (e) {
            e.stopPropagation();
            isPrefsOpen() ? closePrefs() : openPrefs();
        });
    }

    if (prefsClose)   prefsClose.addEventListener('click', closePrefs);
    if (prefsOverlay) prefsOverlay.addEventListener('click', closePrefs);

    // Close on Escape (also closes rack sheet & sort menu if present)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isPrefsOpen()) {
            closePrefs();
        }
    });

    // Close when a nav link inside the sheet is activated
    if (prefsSheet) {
        prefsSheet.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closePrefs);
        });
    }


    // ============================================================
    //  03  NAV ACTIVE STATES
    //
    //  Sets active highlight on:
    //    .prefs-sheet__nav-link  — side sheet nav links (volt colour)
    //    .rack-box[data-tab]     — utility rack shoebox tiles
    //
    //  wall.js owns rack-box state on the homepage.
    //  This block covers all other pages.
    // ============================================================

    var currentPath     = window.location.pathname;

    function normalisePath(p) {
        return p.length > 1 ? p.replace(/\/$/, '') : p;
    }

    var normCurrentPath = normalisePath(currentPath);

    // ── 03a  Prefs sheet nav links ────────────────────────────

    document.querySelectorAll('.prefs-sheet__nav-link[href]').forEach(function (link) {
        if (normalisePath(link.getAttribute('href')) === normCurrentPath) {
            link.style.color      = 'var(--volt, #C8FF00)';
            link.style.fontWeight = '600';
        }
    });

    // ── 03b  Utility rack tabs ────────────────────────────────

    (function () {
        // Maps a path prefix → rack data-tab value.
        // Category paths all map to 'browse' so the Browse tile stays active
        // when users are on /headsets/, /keyboards/, etc.
        var tabMap = {
            '/headsets':    'browse',
            '/keyboards':   'browse',
            '/mice':        'browse',
            '/monitors':    'browse',
            '/chairs':      'browse',
            '/pcs':         'browse',
            '/desks':       'browse',
            '/speakers':    'browse',
            '/extras':      'browse',
            '/guides':      'loadouts',
            '/comparisons': 'drops',
            '/search':      'profile',
            '/about':       'profile',
        };

        var activeTab = null;
        Object.keys(tabMap).forEach(function (prefix) {
            if (normCurrentPath === prefix ||
                normCurrentPath.indexOf(prefix + '/') === 0) {
                activeTab = tabMap[prefix];
            }
        });

        if (activeTab) {
            document.querySelectorAll('.rack-box').forEach(function (box) {
                var isActive = box.getAttribute('data-tab') === activeTab;
                box.classList.toggle('rack-box--active', isActive);
                box.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        }
    }());


    // ============================================================
    //  04  SMOOTH SCROLL
    //
    //  Intercepts same-page anchor links, scrolls smoothly,
    //  pushes state, and moves focus to the target for
    //  keyboard/screen-reader accessibility.
    // ============================================================

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (!href || href === '#') return;

            var target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (history.pushState) {
                history.pushState(null, null, href);
            }

            if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
            }
            target.focus({ preventScroll: true });
        });
    });


    // ============================================================
    //  05  AFFILIATE & OUTBOUND CLICK TRACKING
    //
    //  GA4 event schema matches analytics.js to avoid duplicate
    //  but conflicting events:
    //    affiliate_click — amzn.to / amazon.co.uk links
    //    outbound_click  — all other external links
    //
    //  analytics.js fires select_item (GA4 ecommerce standard) on
    //  the same affiliate clicks; this fires the simpler named
    //  event used for goal funnels in GA4.
    //
    //  NOTE: analytics.js is loaded before this script and handles
    //  its own click listener. Both fire intentionally — one for
    //  ecommerce reporting, one for simple goal tracking.
    // ============================================================

    document.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el.tagName !== 'A') { el = el.parentElement; }
        if (!el || !el.href) return;

        var href = el.href;
        var text = (el.textContent || '').trim().slice(0, 100);
        var page = window.location.pathname;

        // ── Amazon affiliate clicks ───────────────────────────
        if (href.includes('amzn.to') || href.includes('amazon.co.uk')) {
            if (typeof gtag === 'function') {
                gtag('event', 'affiliate_click', {
                    link_url:  href,
                    link_text: text,
                    page_path: page,
                });
            }
            return; // don't double-fire as outbound
        }

        // ── General outbound clicks ───────────────────────────
        if (el.hostname && el.hostname !== window.location.hostname) {
            if (typeof gtag === 'function') {
                gtag('event', 'outbound_click', {
                    link_url:    href,
                    link_domain: el.hostname,
                });
            }
        }
    });


    // ============================================================
    //  06  PWA INSTALL PROMPT
    //
    //  Shown after 30 s on Android/Chrome (deferred prompt) and
    //  iOS Safari (manual share-sheet guide).
    //  Dismissed state stored in sessionStorage — clears on tab close.
    //
    //  Design tokens used (defined in wall-tokens.css + style.css):
    //    --surface-card / --border-strong / --volt / --volt-text
    //    --volt-dim / --text-primary / --text-secondary
    //    --radius-lg / --radius / --font-display / --font-body
    //    --text-sm / --text-xs / --shadow-card
    //    --utility-rack-h (68px) — banner clears the bottom nav
    //    --sp-4 / --sp-6 / --z-banner
    // ============================================================

    (function () {
        var BANNER_KEY    = 'sp-pwa-dismissed';
        var deferredPrompt = null;

        // ── 06a  Guards ───────────────────────────────────────

        // Already installed (standalone PWA)
        if (window.matchMedia('(display-mode: standalone)').matches) return;

        // Already dismissed this session
        try { if (sessionStorage.getItem(BANNER_KEY)) return; } catch (e) {}

        // ── 06b  Banner DOM ───────────────────────────────────

        function createBanner() {
            var banner = document.createElement('div');
            banner.id = 'pwa-install-banner';
            banner.setAttribute('role', 'complementary');
            banner.setAttribute('aria-label', 'Install StackPick app');
            banner.innerHTML =
                '<div class="pwa-banner-inner">' +
                '  <div class="pwa-banner-text">' +
                '    <span class="pwa-banner-icon" aria-hidden="true">⚡</span>' +
                '    <span id="pwa-banner-msg">Install <strong>StackPick</strong> — instant access, works offline.</span>' +
                '  </div>' +
                '  <div class="pwa-banner-actions">' +
                '    <button id="pwa-install-btn" class="pwa-btn-install">Install</button>' +
                '    <button id="pwa-dismiss-btn" class="pwa-btn-dismiss" aria-label="Dismiss install prompt">✕</button>' +
                '  </div>' +
                '</div>';

            // Dismiss
            banner.querySelector('#pwa-dismiss-btn').addEventListener('click', function () {
                _hideBanner(banner);
                try { sessionStorage.setItem(BANNER_KEY, '1'); } catch (e) {}
            });

            // Install / iOS guide
            banner.querySelector('#pwa-install-btn').addEventListener('click', function () {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function (result) {
                        if (typeof gtag === 'function') {
                            gtag('event', 'pwa_install_prompt', { outcome: result.outcome });
                        }
                        deferredPrompt = null;
                        _hideBanner(banner);
                    });
                } else {
                    // iOS Safari — show manual instructions
                    var msg = document.getElementById('pwa-banner-msg');
                    if (msg) {
                        msg.innerHTML =
                            'Tap <strong>Share</strong> in Safari → <strong>Add to Home Screen</strong>.';
                    }
                    banner.querySelector('#pwa-install-btn').style.display = 'none';
                }
            });

            return banner;
        }

        // ── 06c  Styles ───────────────────────────────────────

        function injectStyles() {
            if (document.getElementById('pwa-banner-styles')) return; // idempotent
            var style = document.createElement('style');
            style.id  = 'pwa-banner-styles';
            style.textContent = [
                '#pwa-install-banner {',
                '  position: fixed;',
                '  bottom: calc(var(--utility-rack-h, 68px) + env(safe-area-inset-bottom) + 8px);',
                '  left: var(--sp-4, 1rem);',
                '  right: var(--sp-4, 1rem);',
                '  z-index: var(--z-banner, 600);',
                '  pointer-events: none;',
                '}',
                '@media (min-width: 900px) {',
                '  #pwa-install-banner {',
                '    bottom: var(--sp-6, 1.5rem);',
                '    left: 50%;',
                '    right: auto;',
                '    width: 480px;',
                '    transform: translateX(-50%);',
                '  }',
                '}',
                '.pwa-banner-inner {',
                '  background: var(--surface-card, #141420);',
                '  border: 1px solid var(--border-strong, rgba(255,255,255,0.13));',
                '  border-radius: var(--radius-lg, 12px);',
                '  padding: 0.85rem 1rem;',
                '  display: flex;',
                '  align-items: center;',
                '  gap: 0.75rem;',
                '  box-shadow: var(--shadow-card, 0 8px 32px rgba(0,0,0,0.6));',
                '  pointer-events: all;',
                '}',
                '.pwa-banner-text {',
                '  flex: 1;',
                '  font-family: var(--font-body, var(--font-sans, sans-serif));',
                '  font-size: var(--text-sm, 0.8125rem);',
                '  line-height: 1.4;',
                '  color: var(--text-primary, #F2F0EB);',
                '}',
                '.pwa-banner-icon { margin-right: 0.25rem; }',
                '.pwa-banner-actions {',
                '  display: flex;',
                '  gap: 0.5rem;',
                '  align-items: center;',
                '  flex-shrink: 0;',
                '}',
                '.pwa-btn-install {',
                '  background: var(--volt, #C8FF00);',
                '  color: var(--volt-text, #0A0A0F);',
                '  border: none;',
                '  border-radius: var(--radius, 8px);',
                '  padding: 0.45rem 0.9rem;',
                '  font-family: var(--font-display, var(--font-sans, sans-serif));',
                '  font-size: var(--text-xs, 0.6875rem);',
                '  font-weight: 800;',
                '  letter-spacing: 0.08em;',
                '  text-transform: uppercase;',
                '  cursor: pointer;',
                '  transition: background 150ms;',
                '}',
                '.pwa-btn-install:hover { background: var(--volt-dim, #8FB800); }',
                '.pwa-btn-dismiss {',
                '  background: transparent;',
                '  color: var(--text-secondary, rgba(242,240,235,0.55));',
                '  border: none;',
                '  cursor: pointer;',
                '  font-size: 1rem;',
                '  padding: 0.25rem 0.5rem;',
                '}',
            ].join('\n');
            document.head.appendChild(style);
        }

        // ── 06d  Show / hide ──────────────────────────────────

        function showBanner() {
            try { if (sessionStorage.getItem(BANNER_KEY)) return; } catch (e) {}
            var banner = createBanner();
            injectStyles();
            document.body.appendChild(banner);

            // Animate in — ease-spring from wall-tokens
            banner.style.opacity    = '0';
            banner.style.transform  = (banner.style.transform || '') + ' translateY(16px)';
            banner.style.transition =
                'opacity 300ms var(--ease-spring, cubic-bezier(0.16,1,0.3,1)), ' +
                'transform 300ms var(--ease-spring, cubic-bezier(0.16,1,0.3,1))';

            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    banner.style.opacity   = '1';
                    banner.style.transform = banner.style.transform.replace('translateY(16px)', 'translateY(0)');
                });
            });
        }

        function _hideBanner(banner) {
            banner.style.opacity   = '0';
            banner.style.transform = (banner.style.transform || '') + ' translateY(8px)';
            setTimeout(function () { banner.remove(); }, 320);
        }

        // ── 06e  Platform detection & timing ─────────────────

        // Android / Chrome — use native deferred prompt
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            deferredPrompt = e;
            setTimeout(showBanner, 30000);
        });

        // iOS Safari — no native prompt; show manual guide after 30 s
        var isIOS    = /iphone|ipad|ipod/i.test(navigator.userAgent);
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isIOS && isSafari) {
            setTimeout(showBanner, 30000);
        }

    }());

}());
