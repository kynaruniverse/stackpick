// Main JavaScript functionality
(function() {
    'use strict';
    
    // ===== MOBILE MENU =====
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
        // Toggle menu on button click
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            nav.classList.toggle('active');
            
            // Update aria-expanded for accessibility
            const isExpanded = nav.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            menuToggle.setAttribute('aria-label', isExpanded ? 'Close menu' : 'Open menu');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Open menu');
            }
        });
        
        // Close menu when clicking a link (for anchor navigation)
        nav.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                nav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus(); // Return focus to toggle button
            }
        });
    }
    
    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (href === '#' || href === '') {
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                // Smooth scroll
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
                
                // Focus target for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });
    
    // ===== EXTERNAL LINK TRACKING (optional) =====
    // Track affiliate clicks for analytics
    document.querySelectorAll('a[href*="amzn.to"], a[href*="amazon.co.uk"]').forEach(function(link) {
        link.addEventListener('click', function() {
            // Track affiliate click in GA4 if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'affiliate_click', {
                    'link_url': this.href,
                    'link_text': this.textContent
                });
            }
        });
    });
    
    // ===== LAZY LOAD IMAGES (if you add real product images later) =====
    // Uncomment when you have real images
    /*
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(function(img) {
            imageObserver.observe(img);
        });
    }
    */
    
    // ===== PERFORMANCE: Reduce scroll event firing =====
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // Add any scroll-based functionality here
                // (e.g., sticky header effects, scroll progress, etc.)
                ticking = false;
            });
            ticking = true;
        }
    });
    
})();
