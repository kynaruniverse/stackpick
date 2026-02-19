// StackPick shared nav logic
(function () {
    'use strict';

    // ── BOTTOM NAV MORE PANEL ──
    const moreBtn = document.getElementById('more-btn');
    const morePanel = document.getElementById('more-panel');
    const moreOverlay = document.getElementById('more-overlay');

    function toggleMore(open) {
        if (!morePanel || !moreOverlay || !moreBtn) return;
        morePanel.classList.toggle('open', open);
        moreOverlay.classList.toggle('open', open);
        moreBtn.setAttribute('aria-expanded', String(open));
    }

    if (moreBtn) {
        moreBtn.addEventListener('click', function () {
            toggleMore(!morePanel.classList.contains('open'));
        });
    }
    if (moreOverlay) {
        moreOverlay.addEventListener('click', function () { toggleMore(false); });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') toggleMore(false);
    });

    // ── SIDEBAR THEME BUTTON ──
    const sidebarThemeBtn = document.getElementById('theme-toggle-sidebar');
    const sidebarIcon = document.getElementById('sidebar-theme-icon');
    const sidebarLabel = document.getElementById('sidebar-theme-label');

    function syncSidebarTheme() {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (sidebarIcon) sidebarIcon.textContent = isDark ? '☀️' : '🌙';
        if (sidebarLabel) sidebarLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
    }

    if (sidebarThemeBtn) {
        sidebarThemeBtn.addEventListener('click', function () {
            var mainToggle = document.getElementById('theme-toggle');
            if (mainToggle) mainToggle.click();
            setTimeout(syncSidebarTheme, 50);
        });
        syncSidebarTheme();
    }

    // ── ACTIVE STATE — sidebar links ──
    var path = window.location.pathname;
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });

    // ── ACTIVE STATE — bottom nav links ──
    document.querySelectorAll('.bottom-nav-link[href]').forEach(function (link) {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });

})();
