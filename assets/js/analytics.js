// Google Analytics 4 with privacy controls
(function() {
    'use strict';
    
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    function gtag() {
        dataLayer.push(arguments);
    }
    
    // Set up gtag function globally
    window.gtag = gtag;
    
    // Basic config
    gtag('js', new Date());
    
    // Configure GA4 with privacy-friendly settings
    gtag('config', 'G-ZTN7H3L6DV', {
        'anonymize_ip': true,           // Anonymize IP addresses
        'allow_google_signals': false,  // Disable remarketing
        'allow_ad_personalization_signals': false, // Disable ad personalization
        'cookie_flags': 'SameSite=None;Secure' // Cookie security
    });
    
    // Custom event tracking
    
    // Track affiliate link clicks
    gtag('event', 'page_view', {
        'page_title': document.title,
        'page_location': window.location.href,
        'page_path': window.location.pathname
    });
    
    // Track scroll depth (25%, 50%, 75%, 100%)
    let scrollTracked = {
        '25': false,
        '50': false,
        '75': false,
        '100': false
    };
    
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        ['25', '50', '75', '100'].forEach(function(milestone) {
            if (scrollPercent >= parseInt(milestone) && !scrollTracked[milestone]) {
                gtag('event', 'scroll', {
                    'event_category': 'engagement',
                    'event_label': milestone + '%',
                    'value': parseInt(milestone)
                });
                scrollTracked[milestone] = true;
            }
        });
    });
    
    // Track outbound clicks (affiliate links)
    document.addEventListener('click', function(e) {
        let target = e.target;
        
        // Find parent anchor tag if clicked element is inside one
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
        }
        
        if (target && target.tagName === 'A' && target.href) {
            const href = target.href;
            
            // Track Amazon affiliate clicks
            if (href.includes('amzn.to') || href.includes('amazon.co.uk')) {
                gtag('event', 'click', {
                    'event_category': 'affiliate',
                    'event_label': 'amazon',
                    'value': href
                });
            }
            
            // Track external links
            if (href.indexOf(window.location.hostname) === -1 && !href.startsWith('#')) {
                gtag('event', 'click', {
                    'event_category': 'outbound',
                    'event_label': href
                });
            }
        }
    });
    
    // Track file downloads (if you add PDFs, guides, etc.)
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.href) {
            const ext = e.target.href.split('.').pop().toLowerCase();
            if (['pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx'].includes(ext)) {
                gtag('event', 'file_download', {
                    'event_category': 'downloads',
                    'event_label': e.target.href,
                    'file_extension': ext
                });
            }
        }
    });
    
    // Track search queries (if you add site search later)
    // Uncomment when search is implemented
    /*
    if (window.location.search.includes('q=')) {
        const searchQuery = new URLSearchParams(window.location.search).get('q');
        gtag('event', 'search', {
            'search_term': searchQuery
        });
    }
    */
    
    // Track errors (helps you find broken pages)
    window.addEventListener('error', function(e) {
        gtag('event', 'exception', {
            'description': e.message + ' at ' + e.filename + ':' + e.lineno,
            'fatal': false
        });
    });
    
})();
