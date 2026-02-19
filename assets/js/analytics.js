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
    
    // Track affiliate + outbound clicks — GA4 recommended event format
    document.addEventListener('click', function(e) {
        let target = e.target;
        while (target && target.tagName !== 'A') {
            target = target.parentNode;
        }
        if (!target || target.tagName !== 'A' || !target.href) return;

        const href  = target.href;
        const text  = (target.textContent || '').trim().slice(0, 100);
        const page  = window.location.pathname;

        // Affiliate clicks — GA4 standard: select_item
        if (href.includes('amzn.to') || href.includes('amazon.co.uk')) {
            gtag('event', 'select_item', {
                item_list_name: page,
                items: [{
                    item_name:     text || href,
                    item_category: 'affiliate',
                    item_brand:    'Amazon UK',
                    affiliation:   'Amazon Associates',
                    link_url:      href
                }]
            });
            // Also fire a simpler named event for easy GA4 goal setup
            gtag('event', 'affiliate_click', {
                link_url:      href,
                link_text:     text,
                page_path:     page
            });
        }

        // General outbound (non-affiliate externals)
        else if (target.hostname && target.hostname !== window.location.hostname) {
            gtag('event', 'click', {
                link_url:      href,
                link_domain:   target.hostname,
                outbound:      true
            });
        }

        // File downloads
        const ext = href.split('.').pop().toLowerCase();
        if (['pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx'].includes(ext)) {
            gtag('event', 'file_download', {
                file_extension: ext,
                file_name:      href.split('/').pop(),
                link_url:       href
            });
        }
    });
    
    // Track file downloads (if you add PDFs, guides, etc.)
    
    
    // Track search queries (if you add site search later)
    // Uncomment when search is implemented

    if (window.location.search.includes('q=')) {
        const searchQuery = new URLSearchParams(window.location.search).get('q');
        gtag('event', 'search', {
            'search_term': searchQuery
        });
    }
    
    // Track errors (helps you find broken pages)
    window.addEventListener('error', function(e) {
        gtag('event', 'exception', {
            'description': e.message + ' at ' + e.filename + ':' + e.lineno,
            'fatal': false
        });
    });
    
})();
