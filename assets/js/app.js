// ============================================================
//  STACK PICK — app.js
//  Single consolidated script. Replaces:
//    - theme-toggle.js
//    - nav.js
//    - main.js
//
//  CONTENTS
//  01  Theme — detection, apply, persist, system-sync
//  02  Nav — bottom nav active state, sidebar active state
//  03  More panel — open/close/overlay/keyboard
//  04  Sidebar theme button — synced to main toggle
//  05  Smooth scroll — anchor links
//  06  Affiliate tracking — Amazon click events
//  07  Service worker registration
// ============================================================

(function () {
    'use strict';


    // ============================================================
    //  01  THEME
    // ============================================================

    var html        = document.documentElement;
    var themeToggle = document.getElementById('theme-toggle');

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

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        updateThemeButtons(theme);
    }

    function updateThemeButtons(theme) {
        var isDark = theme === 'dark';

        // Header toggle (mobile)
        if (themeToggle) {
            themeToggle.textContent = isDark ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-label',
                isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }

        // Sidebar toggle (desktop)
        var sidebarIcon  = document.getElementById('sidebar-theme-icon');
        var sidebarLabel = document.getElementById('sidebar-theme-label');
        if (sidebarIcon)  sidebarIcon.textContent  = isDark ? '☀️' : '🌙';
        if (sidebarLabel) sidebarLabel.textContent  = isDark ? 'Light mode' : 'Dark mode';
    }

    function toggleTheme() {
        var current  = html.getAttribute('data-theme') || 'light';
        var next     = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        saveTheme(next);
    }

    // Initialise — saved preference beats system preference
    applyTheme(getSavedTheme() || getSystemTheme());

    // Header toggle click
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Sidebar toggle click — delegate to toggleTheme directly
    var sidebarThemeBtn = document.getElementById('theme-toggle-sidebar');
    if (sidebarThemeBtn) {
        sidebarThemeBtn.addEventListener('click', toggleTheme);
    }

    // Follow system preference changes only when user hasn't set a manual preference
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!getSavedTheme()) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }


    // ============================================================
    //  02  NAV ACTIVE STATES
    // ============================================================

    var path = window.location.pathname;

    // Normalise: strip trailing slash for comparison (except root)
    function normalisePath(p) {
        return p.length > 1 ? p.replace(/\/$/, '') : p;
    }

    var normPath = normalisePath(path);

    // Sidebar links
    document.querySelectorAll('.sidebar-link[href]').forEach(function (link) {
        if (normalisePath(link.getAttribute('href')) === normPath) {
            link.classList.add('active');
        }
    });

    // Bottom nav links
    document.querySelectorAll('.bottom-nav-link[href]').forEach(function (link) {
        if (normalisePath(link.getAttribute('href')) === normPath) {
            link.classList.add('active');
        }
    });

    // More panel links — mark active so user can see where they are
    document.querySelectorAll('.more-panel-link[href]').forEach(function (link) {
        if (normalisePath(link.getAttribute('href')) === normPath) {
            link.style.background      = 'var(--accent-primary)';
            link.style.borderColor     = 'var(--accent-primary)';
            link.style.color           = '#fff';
        }
    });


    // ============================================================
    //  03  MORE PANEL
    // ============================================================

    var moreBtn     = document.getElementById('more-btn');
    var morePanel   = document.getElementById('more-panel');
    var moreOverlay = document.getElementById('more-overlay');

    function isPanelOpen() {
        return morePanel && morePanel.classList.contains('open');
    }

    function openMorePanel() {
        if (!morePanel || !moreOverlay || !moreBtn) return;
        morePanel.classList.add('open');
        moreOverlay.classList.add('open');
        moreBtn.setAttribute('aria-expanded', 'true');
        // Trap focus visually — move focus into panel
        var firstLink = morePanel.querySelector('a, button');
        if (firstLink) firstLink.focus();
    }

    function closeMorePanel() {
        if (!morePanel || !moreOverlay || !moreBtn) return;
        morePanel.classList.remove('open');
        moreOverlay.classList.remove('open');
        moreBtn.setAttribute('aria-expanded', 'false');
    }

    function toggleMorePanel() {
        isPanelOpen() ? closeMorePanel() : openMorePanel();
    }

    if (moreBtn) {
        moreBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMorePanel();
        });
    }

    if (moreOverlay) {
        moreOverlay.addEventListener('click', closeMorePanel);
    }

    // Close panel on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isPanelOpen()) {
            closeMorePanel();
            if (moreBtn) moreBtn.focus();
        }
    });

    // Close panel on any more-panel link click (navigation happening)
    if (morePanel) {
        morePanel.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMorePanel);
        });
    }


    // ============================================================
    //  04  SMOOTH SCROLL — anchor links
    // ============================================================

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href   = this.getAttribute('href');
            if (!href || href === '#') return;

            var target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Update URL without jump
            if (history.pushState) {
                history.pushState(null, null, href);
            }

            // Accessibility: move focus to target
            if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
            }
            target.focus({ preventScroll: true });
        });
    });


    // ============================================================
    //  05  AFFILIATE CLICK TRACKING
    //  Fires a GA4 event for every Amazon affiliate link click.
    //  analytics.js loads gtag separately — we just fire events.
    // ============================================================

    document.addEventListener('click', function (e) {
        // Walk up the DOM to find the nearest anchor
        var el = e.target;
        while (el && el.tagName !== 'A') { el = el.parentElement; }
        if (!el || !el.href) return;

        var href = el.href;

        // Amazon affiliate clicks
        if (href.includes('amzn.to') || href.includes('amazon.co.uk')) {
            if (typeof gtag === 'function') {
                gtag('event', 'affiliate_click', {
                    link_url:  href,
                    link_text: el.textContent.trim().slice(0, 100)
                });
            }
        }

        // General outbound clicks (non-affiliate externals)
        if (
            el.hostname &&
            el.hostname !== window.location.hostname &&
            !href.includes('amzn.to') &&
            !href.includes('amazon.co.uk')
        ) {
            if (typeof gtag === 'function') {
                gtag('event', 'outbound_click', { link_url: href });
            }
        }
    });


    // ============================================================
    //  06  SERVICE WORKER REGISTRATION
    // ============================================================

    if ('serviceWorker' in navigator) {
        // Register after page load — don't block first render
        window.addEventListener('load', function () {
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then(function (reg) {
                    // Check for updates on every page load
                    reg.update();

                    // When a new SW is waiting, notify it to activate
                    reg.addEventListener('updatefound', function () {
                        var newWorker = reg.installing;
                        if (!newWorker) return;

                        newWorker.addEventListener('statechange', function () {
                            if (
                                newWorker.state === 'installed' &&
                                navigator.serviceWorker.controller
                            ) {
                                // A new version is ready.
                                // Silent update — no intrusive prompt.
                                // New SW will take over on next navigation.
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                            }
                        });
                    });
                })
                .catch(function (err) {
                    // SW registration failed — site still works, just no offline support
                    console.warn('[SP] Service worker registration failed:', err);
                });

            // When a new SW takes control, reload to get fresh assets
            var refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', function () {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });
        });
    }


    // ============================================================
    //  08  PWA INSTALL PROMPT
    // ============================================================
    //
    //  Shows a subtle bottom banner after 30 seconds.
    //  Respects: already installed, user dismissed, iOS vs Android.
    //
    (function () {
        var BANNER_DISMISSED_KEY = 'sp-pwa-dismissed';
        var deferredPrompt = null;

        // Never show if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) return;

        // Never show if dismissed this session
        try {
            if (sessionStorage.getItem(BANNER_DISMISSED_KEY)) return;
        } catch (e) {}

        function createBanner() {
            var banner = document.createElement('div');
            banner.id = 'pwa-install-banner';
            banner.setAttribute('role', 'banner');
            banner.innerHTML =
                '<div class="pwa-banner-inner">' +
                '  <div class="pwa-banner-text">' +
                '    <span class="pwa-banner-icon">⚡</span>' +
                '    <span id="pwa-banner-msg">Install <strong>StackPick</strong> for instant access — works offline too.</span>' +
                '  </div>' +
                '  <div class="pwa-banner-actions">' +
                '    <button id="pwa-install-btn" class="pwa-btn-install">Install</button>' +
                '    <button id="pwa-dismiss-btn" class="pwa-btn-dismiss" aria-label="Dismiss">✕</button>' +
                '  </div>' +
                '</div>';

            banner.querySelector('#pwa-dismiss-btn').addEventListener('click', function () {
                banner.remove();
                try { sessionStorage.setItem(BANNER_DISMISSED_KEY, '1'); } catch (e) {}
            });

            banner.querySelector('#pwa-install-btn').addEventListener('click', function () {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function (result) {
                        if (typeof gtag === 'function') {
                            gtag('event', 'pwa_install_prompt', { outcome: result.outcome });
                        }
                        deferredPrompt = null;
                        banner.remove();
                    });
                } else {
                    // iOS — switch to manual instruction
                    document.getElementById('pwa-banner-msg').innerHTML =
                        'Tap the <strong>Share</strong> button in Safari, then <strong>Add to Home Screen</strong>.';
                    banner.querySelector('#pwa-install-btn').style.display = 'none';
                }
            });

            return banner;
        }

        function injectStyles() {
            var style = document.createElement('style');
            style.textContent =
                '#pwa-install-banner {' +
                '  position: fixed; bottom: 72px; left: 0; right: 0; z-index: 200; padding: 0 1rem; pointer-events: none;' +
                '}' +
                '@media(min-width:768px){#pwa-install-banner{bottom:1rem;max-width:480px;left:50%;transform:translateX(-50%);}}' +
                '.pwa-banner-inner {' +
                '  background: var(--card-bg, #1e293b); border: 1px solid var(--border, #334155);' +
                '  border-radius: 12px; padding: 0.85rem 1rem; display: flex; align-items: center;' +
                '  gap: 0.75rem; box-shadow: 0 4px 24px rgba(0,0,0,.35); pointer-events: all;' +
                '}' +
                '.pwa-banner-text { flex: 1; font-size: 0.875rem; line-height: 1.4; color: var(--text-primary, #f1f5f9); }' +
                '.pwa-banner-icon { margin-right: 0.4rem; }' +
                '.pwa-banner-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }' +
                '.pwa-btn-install {' +
                '  background: #3b82f6; color: #fff; border: none; border-radius: 8px;' +
                '  padding: 0.45rem 0.9rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.15s;' +
                '}' +
                '.pwa-btn-install:hover { background: #2563eb; }' +
                '.pwa-btn-dismiss {' +
                '  background: transparent; color: var(--text-secondary, #94a3b8);' +
                '  border: none; cursor: pointer; font-size: 1rem; padding: 0.25rem 0.5rem;' +
                '}';
            document.head.appendChild(style);
        }

        function showBanner() {
            // Re-check dismissed in case another tab set it
            try { if (sessionStorage.getItem(BANNER_DISMISSED_KEY)) return; } catch (e) {}
            var banner = createBanner();
            injectStyles();
            document.body.appendChild(banner);
            // Animate in
            banner.style.cssText += '; opacity:0; transform:translateY(20px); transition:opacity 0.3s,transform 0.3s';
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    banner.style.opacity = '1';
                    banner.style.transform = 'translateY(0)';
                });
            });
        }

        // Chrome / Android — capture the deferred prompt
        window.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            deferredPrompt = e;
            setTimeout(showBanner, 30000);
        });

        // iOS Safari — no beforeinstallprompt, show manual guide after 30s
        var isIOS    = /iphone|ipad|ipod/i.test(navigator.userAgent);
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isIOS && isSafari) {
            setTimeout(showBanner, 30000);
        }

    }());

})();
