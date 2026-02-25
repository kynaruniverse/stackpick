// ============================================================
//  STACK PICK — theme.js
//  Shared theme management — Force Marry Edition.
// ============================================================

(function() {
  'use strict';
  
  var html = document.documentElement;
  
  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ?
      'dark' : 'light';
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
    var icon = isDark ? '☀️' : '🌙';
    var label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    
    // ── Universal Theme Toggle buttons ──
    document.querySelectorAll('.nav__theme-btn, .theme-toggle').forEach(function(btn) {
      var sp = btn.querySelector('.theme-toggle__icon');
      if (sp) sp.textContent = icon;
      else btn.textContent = icon;
      btn.setAttribute('aria-label', label);
    });
    
    // ── Sidebar theme button (category pages) ──
    var sidebarBtn = document.getElementById('theme-toggle-sidebar');
    if (sidebarBtn) {
      var sidebarIcon = document.getElementById('sidebar-theme-icon');
      var sidebarLabel = document.getElementById('sidebar-theme-label');
      if (sidebarIcon) sidebarIcon.textContent = icon;
      if (sidebarLabel) sidebarLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
      sidebarBtn.setAttribute('aria-label', label);
    }
  } // <--- Fixed: Added missing closing brace for applyTheme
  
  function toggleTheme() {
    var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  }
  
  function initTheme() {
    applyTheme(getSavedTheme() || getSystemTheme());
    
    // Wire all theme-capable buttons
    var themeButtons = '.nav__theme-btn, .theme-toggle, #theme-toggle-sidebar, #more-panel-theme';
    document.querySelectorAll(themeButtons).forEach(function(btn) {
      btn.addEventListener('click', toggleTheme);
    });
    
    // Follow OS preference when no saved preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!getSavedTheme()) applyTheme(e.matches ? 'dark' : 'light');
      });
    }
  }
  
  window.SP_applyTheme = applyTheme;
  window.SP_toggleTheme = toggleTheme;
  window.SP_initTheme = initTheme;
  
}());