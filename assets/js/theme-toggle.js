// Theme toggle functionality with error handling and system preference detection
(function() {
    'use strict';
    
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }
    
    // Function to detect system dark mode preference
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    
    // Get saved theme or use system preference
    function getCurrentTheme() {
        try {
            const saved = localStorage.getItem('theme');
            return saved || getSystemTheme();
        } catch (e) {
            console.warn('localStorage not available, using system theme:', e);
            return getSystemTheme();
        }
    }
    
    // Apply theme
    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }
    
    // Update theme icon
    function updateThemeIcon(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        themeToggle.setAttribute('aria-label', 
            theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
        );
    }
    
    // Save theme preference
    function saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    }
    
    // Initialize theme
    const currentTheme = getCurrentTheme();
    applyTheme(currentTheme);
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        const current = html.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        
        applyTheme(newTheme);
        saveTheme(newTheme);
    });
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only auto-switch if user hasn't manually set a preference
            try {
                if (!localStorage.getItem('theme')) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            } catch (err) {
                console.warn('Could not check theme preference:', err);
            }
        });
    }
    
})();
