// ============================================================
//  STACK PICK — theme.js
//  Shared theme management — loaded on every page before
//  app.js and wall.js.
//
//  Exposes on window:
//    SP_applyTheme(theme)  — apply + sync all buttons
//    SP_toggleTheme()      — flip dark ↔ light
//    SP_initTheme()        — read saved/system pref, apply, wire buttons
// ============================================================

(function () {
  'use strict';

  var html = document.documentElement;

  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }

  function getSavedTheme() {
    try { return localStorage.getItem('sp-theme'); }
    catch (e) { return null; }
  }

  function saveTheme(theme) {
    try { localStorage.setItem('sp-theme', theme); }
    catch (e) {}
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    var isDark = theme === 'dark';
    var icon   = isDark ? '☀️' : '🌙';
    var label  = isDark ? 'Switch to light mode' : 'Switch to dark mode';

    // ── Header .theme-toggle buttons (class-based, any page) ──
    // Handles buttons with a .theme-toggle__icon child span,
    // and plain buttons with just text content (header.html pattern).
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      var sp = btn.querySelector('.theme-toggle__icon');
      if (sp) sp.textContent = icon; else btn.textContent = icon;
      btn.setAttribute('aria-label', label);
    });

    // ── Desktop patch-rail button (homepage) ──────────────────
    var railBtn = document.getElementById('patch-rail-theme') ||
                  document.querySelector('.patch-rail__theme-btn');
    if (railBtn) {
      var ri = railBtn.querySelector('.patch-rail__theme-icon');
      if (ri) ri.textContent = icon; else railBtn.textContent = icon;
      railBtn.setAttribute('aria-label', label);
    }

    // ── Sidebar theme button (category pages) ─────────────────
    // sidebar.html uses two separate child spans:
    //   #sidebar-theme-icon  — the emoji
    //   #sidebar-theme-label — the text label ("Dark mode" / "Light mode")
    var sidebarBtn = document.getElementById('theme-toggle-sidebar');
    if (sidebarBtn) {
      var sidebarIcon  = document.getElementById('sidebar-theme-icon');
      var sidebarLabel = document.getElementById('sidebar-theme-label');
      if (sidebarIcon)  sidebarIcon.textContent  = icon;
      if (sidebarLabel) sidebarLabel.textContent = isDark ? 'Dark mode' : 'Light mode';
      sidebarBtn.setAttribute('aria-label', label);
    }

    // ── Prefs sheet value label ───────────────────────────────
    var prefVal = document.getElementById('pref-theme-val');
    if (prefVal) prefVal.textContent = isDark ? 'Dark' : 'Light';
  }

  function toggleTheme() {
    var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  }

  function initTheme() {
    applyTheme(getSavedTheme() || getSystemTheme());

    // Wire all .theme-toggle buttons (header)
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    // Wire patch-rail theme button (homepage)
    var railBtn = document.getElementById('patch-rail-theme') ||
                  document.querySelector('.patch-rail__theme-btn');
    if (railBtn) railBtn.addEventListener('click', toggleTheme);

    // Wire sidebar theme button (category pages)
    var sidebarBtn = document.getElementById('theme-toggle-sidebar');
    if (sidebarBtn) sidebarBtn.addEventListener('click', toggleTheme);

    // Follow OS preference when no saved preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!getSavedTheme()) applyTheme(e.matches ? 'dark' : 'light');
      });
    }
  }

  window.SP_applyTheme  = applyTheme;
  window.SP_toggleTheme = toggleTheme;
  window.SP_initTheme   = initTheme;

}());