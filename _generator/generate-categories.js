'use strict';

/**
 * StackPick generate-categories.js
 *
 * Reads:  _data/products.json
 * Writes: mice/index.html
 *         keyboards/index.html
 *         headsets/index.html
 *         monitors/index.html
 *         chairs/index.html
 *
 * Run standalone: node _generator/generate-categories.js
 * Called by:      _generator/build.js
 */

const fs   = require('fs');
const path = require('path');

const { renderPage, writeFile } = require('./lib/render.js');

const ROOT         = path.join(__dirname, '..');
const DATA_FILE    = path.join(ROOT, '_data', 'products.json');
const TEMPLATE_DIR = path.join(ROOT, '_templates');
const PARTIALS_DIR = path.join(TEMPLATE_DIR, '_partials');
const TEMPLATE     = fs.readFileSync(path.join(TEMPLATE_DIR, 'category.html'), 'utf8');

// ---------------------------------------------------------------------------
// Per-category configuration
// All copy here was taken verbatim from the original hand-written HTML pages.
// ---------------------------------------------------------------------------
const CATEGORY_CONFIG = {
  mice: {
    slug:            'mice',
    emoji:           '🖱️',
    pageTitle:       'Best Gaming Mice UK 2026 | Stack Pick',
    metaDescription: 'Best gaming mice for UK gamers. From sub-40g "super-clones" to the 8K polling pros use. Verified 2026 UK pricing.',
    ogTitle:         'Best Gaming Mice UK 2026 | Stack Pick',
    ogDescription:   'Stop using heavy, laggy mice. We\'ve researched the best 4K/8K wireless and budget-beating gaming mice in the UK.',
    canonical:       'https://stackpick.co.uk/mice/',
    heroTitle:       'Best Gaming Mice (UK)',
    heroSubtitle:    'From sub-40g "super-clones" to the 8K polling pros use. Updated Feb 2026.',
    breadcrumbLabel: 'Gaming Mice',
    buyingGuide: `<h2>The 2026 Mouse Guide</h2>
<h3>Polling Rate: 1K vs 4K vs 8K</h3>
<p>Standard mice report to your PC 1,000 times per second (1K). In 2026, <strong>4K and 8K polling</strong> report up to 8,000 times. On a 240Hz or 360Hz monitor, this makes mouse movement look significantly smoother and reduces input lag by microseconds.</p>
<h3>Optical vs Mechanical Switches</h3>
<p>Legacy mechanical switches eventually wear out and "double-click." <strong>Optical switches</strong> (like Razer's Gen-3 or Logitech's Lightforce) use a beam of light to register clicks. They are faster and, more importantly, effectively impossible to break.</p>
<p class="last-updated"><em>Last updated: February 2026. Prices checked weekly.</em></p>`,
  },

  keyboards: {
    slug:            'keyboards',
    emoji:           '⌨️',
    pageTitle:       'Best Gaming Keyboards UK 2026 | Stack Pick',
    metaDescription: 'Best gaming keyboards for UK gamers 2026. Hall Effect, wireless, and budget mechanical picks — verified UK pricing on Amazon.',
    ogTitle:         'Best Gaming Keyboards UK 2026 | Stack Pick',
    ogDescription:   'From Hall Effect Rapid Trigger to creamy gasket-mount acoustics — the keyboards UK gamers actually buy. Real prices, no BS.',
    canonical:       'https://stackpick.co.uk/keyboards/',
    heroTitle:       'Best Gaming Keyboards (UK)',
    heroSubtitle:    'Hall Effect, wireless, and budget mechanical picks. Updated Feb 2026.',
    breadcrumbLabel: 'Gaming Keyboards',
    buyingGuide: `<h2>The 2026 Buying Guide</h2>
<h3>What is "Rapid Trigger"?</h3>
<p>Standard keyboards actuate at a fixed point. <strong>Hall Effect (HE)</strong> boards like the <strong>Apex Pro</strong> use magnets to track every millimetre. Rapid Trigger resets the key the instant you lift your finger, letting you stop or strafe faster than physically possible on a normal board.</p>
<h3>Why "Creamy" sounds better</h3>
<p>Traditional "Clicky" keyboards are loud and hollow. "Creamy" boards like the <strong>Aula F99</strong> use pre-lubed switches and gasket mounts to dampen vibrations, creating a deep, satisfying "thock" sound that feels much more premium.</p>
<p class="last-updated"><em>Last updated: February 2026. Prices checked weekly.</em></p>`,
  },

  headsets: {
    slug:            'headsets',
    emoji:           '🎧',
    pageTitle:       'Best Gaming Headsets UK 2026 | Stack Pick',
    metaDescription: 'Best gaming headsets for UK gamers 2026. From audiophile open-back to wireless premium — verified UK pricing on Amazon.',
    ogTitle:         'Best Gaming Headsets UK 2026 | Stack Pick',
    ogDescription:   'From £40 wired picks to premium wireless with hot-swap batteries — the headsets UK gamers actually rate. Real prices, no BS.',
    canonical:       'https://stackpick.co.uk/headsets/',
    heroTitle:       'Best Gaming Headsets (UK)',
    heroSubtitle:    'From open-back audiophile to wireless premium. Updated Feb 2026.',
    breadcrumbLabel: 'Gaming Headsets',
    buyingGuide: `<h2>The 2026 Headset Guide</h2>
<h3>Open-back vs Closed-back</h3>
<p><strong>Open-back</strong> headphones (like the Sennheiser HD 560S) let sound in and out — creating a wider, more natural soundstage that makes footstep positioning in FPS significantly clearer. The trade-off: everyone nearby can hear your game, and ambient noise bleeds in. <strong>Closed-back</strong> gaming headsets isolate you from the room — better for noisy environments and voice chat.</p>
<h3>Wireless latency — solved</h3>
<p>The days of noticeable wireless audio lag are over. 2.4GHz wireless (used by HyperX, SteelSeries, and Logitech) operates at sub-5ms latency — imperceptible in gaming. The remaining reason to choose wired is budget: wired headsets deliver better hardware per pound at the same price point.</p>
<p class="last-updated"><em>Last updated: February 2026. Prices checked weekly.</em></p>`,
  },

  monitors: {
    slug:            'monitors',
    emoji:           '🖥️',
    pageTitle:       'Best Gaming Monitors UK 2026 | Stack Pick',
    metaDescription: 'Best gaming monitors for UK gamers 2026. OLED, Mini-LED, and budget IPS picks — verified UK pricing on Amazon.',
    ogTitle:         'Best Gaming Monitors UK 2026 | Stack Pick',
    ogDescription:   'From glossy WOLED to HDR1000 Mini-LED — the monitors UK gamers are actually buying. Real prices, no BS.',
    canonical:       'https://stackpick.co.uk/monitors/',
    heroTitle:       'Best Gaming Monitors (UK)',
    heroSubtitle:    'OLED, Mini-LED, and the budget IPS that punches above its weight. Updated Feb 2026.',
    breadcrumbLabel: 'Gaming Monitors',
    buyingGuide: `<h2>2026 Buying Guide: Glossy, Mini-LED &amp; OLED</h2>
<h3>The "Glossy" Revolution</h3>
<p>One of the biggest shifts in 2026 has been the move toward Glossy WOLED panels, like the ASUS ROG Strix listed above. Traditional matte coatings can make OLED blacks look slightly "grey" in lit rooms. Glossy panels maintain that infinite contrast and make colors pop, though they do require more light control in your room.</p>
<h3>Mini-LED: The OLED Alternative</h3>
<p>If you work in a bright room or fear OLED burn-in, <strong>Mini-LED</strong> is now the standard. Models like the AOC Q27G3XMN offer HDR1000, meaning they get twice as bright as most OLEDs. For digital artists and HDR movie fans, the 1152 dimming zones on the MSI MAG ensure deep blacks without burn-in risk.</p>
<h3>What is Dual-Mode?</h3>
<p>New for this year, monitors like the MSI MAG feature <strong>Dual-Mode</strong>. This allows you to run in 4K for single-player games, then switch to 1080p at a much higher refresh rate (320Hz+) for competitive shooters like Valorant or CS2.</p>
<h3>How We Pick</h3>
<p>We analyze community sentiment from r/Monitors and Discord tech hubs. Everything listed is verified for UK stock and pricing, checked weekly.</p>
<p class="last-updated"><em>Last updated: February 2026. Prices checked daily.</em></p>`,
  },

  chairs: {
    slug:            'chairs',
    emoji:           '🪑',
    pageTitle:       'Best Gaming Chairs UK 2026 | Stack Pick',
    metaDescription: 'Best gaming chairs for UK gamers 2026. Crowd-researched picks for every type of buyer — from budget to breathable mesh to back pain relief. Verified UK pricing on Amazon.',
    ogTitle:         'Best Gaming Chairs UK 2026 | Stack Pick',
    ogDescription:   'Five chairs for five real problems. Budget, mesh, back pain, comfort, and the best overall — all available on Amazon UK.',
    canonical:       'https://stackpick.co.uk/chairs/',
    heroTitle:       'Best Gaming Chairs UK',
    heroSubtitle:    'Five chairs for five real problems. Crowd-researched picks based on what UK gamers actually ask about. Updated February 2026.',
    breadcrumbLabel: 'Gaming Chairs',
    buyingGuide: `<h2>The 2026 Chair Buying Guide</h2>
<h3>Gaming chair vs office chair — honest answer</h3>
<p>This is the most debated question across r/battlestations, r/pcmasterrace and every gaming Discord. The honest answer: at the budget end (under £200), gaming chairs tend to beat office chairs for comfort and build quality. Once you're spending £300+, ergonomic design matters more than aesthetics, and purpose-built ergonomic chairs like the Sihoo Doro C300 will do more for your back than any racing-style bucket seat.</p>
<h3>What actually matters for long sessions</h3>
<p>Lumbar support is the single most important factor for anyone sitting more than 3 hours at a stretch. Look for adjustable lumbar that moves with you — not just a fixed cushion. After that, seat depth matters more than most people realise: your back should touch the rest while your feet sit flat on the floor. Armrests that actually adjust to your desk height make a bigger difference than any other spec.</p>
<h3>Leather vs mesh — the real difference</h3>
<p>PU leatherette looks great and feels premium out of the box, but gets hot in summer and typically starts cracking after 2–3 years of heavy use. Mesh breathes significantly better and tends to age more gracefully — but can feel firmer. If you run hot or game in a warm room, mesh is worth the switch. The Eureka Typhon and Sihoo Doro C300 are both full mesh and fix the sweaty chair problem entirely.</p>
<h3>How we picked these</h3>
<p>We cross-referenced Reddit's r/battlestations, r/pcmasterrace and dedicated chair communities with hands-on reviews from PC Gamer, TechRadar and Tom's Guide, then filtered by what's actually available and priced honestly on Amazon UK. No grey imports, no US-only stock. Prices are checked weekly.</p>
<p class="last-updated"><em>Last updated: February 2026. Prices checked weekly.</em></p>`,
  },
};

// ---------------------------------------------------------------------------
// Badge colour map — matches the original inline styles from the hand-written HTML
// We only store non-default colours (default = no inline style, uses CSS class colour)
// ---------------------------------------------------------------------------
const BADGE_COLORS = {
  // mice
  'mice-razer-viper-v3-pro':          '#22c55e',
  'mice-endgame-gear-op1w':           '#3b82f6',
  'mice-lamzu-thorn-4k':              '#f97316',
  'mice-atk-vxe-mad-r':              '#ef4444',
  // keyboards
  'keyboards-aula-f99-wireless':      '#8b5cf6',
  'keyboards-keychron-c3-pro':        '#10b981',
  // headsets — no inline overrides in original
  // monitors
  'monitors-asus-rog-xg27aqdmg':      '#ef4444',
  // chairs — no inline overrides in original
};

// RRP data — products that show a crossed-out RRP in the original HTML
const PRICE_RRP = {
  'mice-razer-viper-v3-pro':               { rrp: '£159.99', saving: 'Save £42' },
  'mice-logitech-g502x-plus':              { rrp: '£149.99', saving: 'Save £55' },
  'keyboards-steelseries-apex-pro-tkl-gen3': { rrp: '£209.99', saving: 'Save £20' },
  'keyboards-keychron-c3-pro':             { rrp: '£45.99',  saving: 'Save £6'  },
  'monitors-msi-mag-274updf':              { rrp: '£449.00', saving: 'Save £50' },
};

// ---------------------------------------------------------------------------
// Build a single product card HTML string
// ---------------------------------------------------------------------------
function buildProductCard(product) {
  const badgeColor = BADGE_COLORS[product.id] || null;
  const rrpData    = PRICE_RRP[product.id]    || null;

  const badgeStyle = badgeColor ? ` style="background:${badgeColor};"` : '';

  const rrpBlock = rrpData ? `
              <span class="price-rrp-wrap">
                <span class="price-rrp-label">RRP</span>
                <span class="price-rrp">${rrpData.rrp}</span>
              </span>
              <span class="price-saving">${rrpData.saving}</span>` : '';

  const prosHTML = product.pros.map(p =>
    `              <li class="pro"><span class="pro-icon">✓</span> ${p}</li>`
  ).join('\n');

  const consHTML = product.cons.map(c =>
    `              <li class="con"><span class="con-icon">✕</span> ${c}</li>`
  ).join('\n');

  return `        <div class="product-card">
          <div class="product-image-placeholder" aria-hidden="true">${product.emoji}</div>
          <div class="product-content">
            <span class="product-badge"${badgeStyle}>${product.badge}</span>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price-block">
              <span class="price-current-label">Amazon price</span>
              <span class="price-current">${product.price}</span>${rrpBlock}
            </div>
            <p class="product-desc">${product.desc}</p>
            <ul class="product-features">
${prosHTML}
${consHTML}
            </ul>
            <a href="${product.affiliate}" target="_blank" rel="noopener sponsored" class="product-btn">View on Amazon →</a>
          </div>
        </div>`;
}

// ---------------------------------------------------------------------------
// Build schema.org ItemList JSON-LD for a category
// ---------------------------------------------------------------------------
function buildSchemaItemList(config, products) {
  const items = products.map((p, i) => ({
    '@type':    'ListItem',
    position:   i + 1,
    item: {
      '@type':  'Product',
      name:     p.name,
      brand:    { '@type': 'Brand', name: p.name.split(' ')[0] },
      offers:   {
        '@type':        'Offer',
        priceCurrency:  'GBP',
        price:          String(p.priceRaw),
        availability:   p.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
    },
  }));

  const itemList = {
    '@context':     'https://schema.org',
    '@type':        'ItemList',
    name:           config.pageTitle.replace(' | Stack Pick', ''),
    url:            config.canonical,
    numberOfItems:  products.length,
    itemListElement: items,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',              item: 'https://stackpick.co.uk/' },
      { '@type': 'ListItem', position: 2, name: config.breadcrumbLabel, item: config.canonical },
    ],
  };

  return `  <script type="application/ld+json">\n  ${JSON.stringify(itemList)}\n  </script>\n` +
         `  <script type="application/ld+json">\n  ${JSON.stringify(breadcrumb)}\n  </script>`;
}

// ---------------------------------------------------------------------------
// Generate one category page
// ---------------------------------------------------------------------------
function generateCategory(config, products) {
  const categoryProducts = products.filter(p => p.category === config.slug);

  const productCardsHTML = categoryProducts.map(buildProductCard).join('\n\n');
  const schemaJSON       = buildSchemaItemList(config, categoryProducts);

  const data = {
    // head.html placeholders
    pageTitle:       config.pageTitle,
    metaDescription: config.metaDescription,
    ogType:          'website',
    ogTitle:         config.ogTitle,
    ogDescription:   config.ogDescription,
    canonical:       config.canonical,
    emoji:           config.emoji,
    schemaJSON:      schemaJSON,
    // header/sidebar active page
    activePage:      config.slug,
    // category.html placeholders
    heroTitle:       config.heroTitle,
    heroSubtitle:    config.heroSubtitle,
    breadcrumbLabel: config.breadcrumbLabel,
    // rendered HTML blobs (injected via {{{...}}} raw — already safe HTML)
    productCardsHTML: productCardsHTML,
    buyingGuideHTML:  config.buyingGuide,
  };

  // renderPage handles partials + wraps in page-wrapper div
  return renderPage({ partialsDir: PARTIALS_DIR, template: TEMPLATE, data });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function run() {
  const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  let count = 0;
  for (const [slug, config] of Object.entries(CATEGORY_CONFIG)) {
    const html       = generateCategory(config, products);
    const outputPath = path.join(ROOT, slug, 'index.html');
    writeFile(outputPath, html);
    console.log(`  ✓ ${slug}/index.html`);
    count++;
  }

  console.log(`\n  Generated ${count} category pages.`);
}

run();
