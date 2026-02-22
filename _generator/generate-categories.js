'use strict';

/**
 * StackPick generate-categories.js
 *
 * Reads:  _data/collections.json   — product IDs and collection groupings
 *         _data/products.json      — full product records (name, price, badge, etc.)
 * Writes: mice/index.html
 *         keyboards/index.html
 *         headsets/index.html
 *         monitors/index.html
 *         chairs/index.html
 *
 * Run standalone: node _generator/generate-categories.js
 * Called by:      _generator/build.js
 *
 * Data contract (products.json):
 *   Each product object must contain:
 *     id          {string}   — e.g. "mice-razer-viper-v3-pro"
 *     category    {string}   — slug matching a CATEGORY_CONFIG key
 *     brand       {string}   — explicit brand name for schema.org e.g. "Razer"
 *     name        {string}
 *     badge       {string}
 *     price       {string}   — display string e.g. "£119"
 *     priceRaw    {number}   — numeric price for schema.org e.g. 119
 *     inStock     {boolean}  — for schema.org availability
 *     affiliate   {string}   — Amazon affiliate URL
 *     desc        {string}
 *     emoji       {string}
 *     pros        {string[]}
 *     cons        {string[]}
 */

const fs   = require('fs');
const path = require('path');

const { renderPage, writeFile, escapeHtml } = require('./lib/render.js');

const ROOT             = path.join(__dirname, '..');
const COLLECTIONS_FILE = path.join(ROOT, '_data', 'collections.json');
const PRODUCTS_FILE    = path.join(ROOT, '_data', 'products.json');
const TEMPLATE_DIR     = path.join(ROOT, '_templates');
const PARTIALS_DIR     = path.join(TEMPLATE_DIR, '_partials');
const TEMPLATE         = fs.readFileSync(path.join(TEMPLATE_DIR, 'category.html'), 'utf8');

// ---------------------------------------------------------------------------
// Per-category configuration
// All copy taken verbatim from the original hand-written HTML pages.
// Note: key names here intentionally match the template placeholder names.
// ---------------------------------------------------------------------------
const CATEGORY_CONFIG = {
  mice: {
    emoji:           '🖱️',
    pageTitle:       'Best Gaming Mice UK 2026 | Stack Pick',
    metaDescription: 'Best gaming mice for UK gamers. From sub-40g "super-clones" to the 8K polling pros use. Verified 2026 UK pricing.',
    ogTitle:         'Best Gaming Mice UK 2026 | Stack Pick',
    ogDescription:   'Stop using heavy, laggy mice. We\'ve researched the best 4K/8K wireless and budget-beating gaming mice in the UK.',
    canonical:       'https://stackpick.co.uk/mice/',
    heroTitle:       'Best Gaming Mice (UK)',
    heroSubtitle:    'From sub-40g "super-clones" to the 8K polling pros use. Updated Feb 2026.',
    breadcrumbLabel: 'Gaming Mice',
    buyingGuideHTML: `<h2>The 2026 Mouse Guide</h2>
<h3>Polling Rate: 1K vs 4K vs 8K</h3>
<p>Standard mice report to your PC 1,000 times per second (1K). In 2026, <strong>4K and 8K polling</strong> report up to 8,000 times. On a 240Hz or 360Hz monitor, this makes mouse movement look significantly smoother and reduces input lag by microseconds.</p>
<h3>Optical vs Mechanical Switches</h3>
<p>Legacy mechanical switches eventually wear out and "double-click." <strong>Optical switches</strong> (like Razer's Gen-3 or Logitech's Lightforce) use a beam of light to register clicks. They are faster and, more importantly, effectively impossible to break.</p>
<p class="last-updated"><em>Last updated: February 2026. Prices checked weekly.</em></p>`,
  },

  keyboards: {
    emoji:           '⌨️',
    pageTitle:       'Best Gaming Keyboards UK 2026 | Stack Pick',
    metaDescription: 'Best gaming keyboards for UK gamers 2026. Hall Effect, wireless, and budget mechanical picks — verified UK pricing on Amazon.',
    ogTitle:         'Best Gaming Keyboards UK 2026 | Stack Pick',
    ogDescription:   'From Hall Effect Rapid Trigger to creamy gasket-mount acoustics — the keyboards UK gamers actually buy. Real prices, no BS.',
    canonical:       'https://stackpick.co.uk/keyboards/',
    heroTitle:       'Best Gaming Keyboards (UK)',
    heroSubtitle:    'Hall Effect, wireless, and budget mechanical picks. Updated Feb 2026.',
    breadcrumbLabel: 'Gaming Keyboards',
    buyingGuideHTML: `<h2>The 2026 Buying Guide</h2>
<h3>What is "Rapid Trigger"?</h3>
<p>Standard keyboards actuate at a fixed point. <strong>Hall Effect (HE)</strong> boards like the <strong>Apex Pro</strong> use magnets to track every millimetre. Rapid Trigger resets the key the instant you lift your finger, letting you stop or strafe faster than physically possible on a normal board.</p>
<h3>Why "Creamy" sounds better</h3>
<p>Traditional "Clicky" keyboards are loud and hollow. "Creamy" boards like the <strong>Aula F99</strong> use pre-lubed switches and gasket mounts to dampen vibrations, creating a deep, satisfying "thock" sound that feels much more premium.</p>
<p class="last-updated"><em>Last updated: February 2026. Prices checked weekly.</em></p>`,
  },

  headsets: {
    emoji:           '🎧',
    pageTitle:       'Best Gaming Headsets UK 2026 | Stack Pick',
    metaDescription: 'Best gaming headsets for UK gamers 2026. From audiophile open-back to wireless premium — verified UK pricing on Amazon.',
    ogTitle:         'Best Gaming Headsets UK 2026 | Stack Pick',
    ogDescription:   'From £40 wired picks to premium wireless with hot-swap batteries — the headsets UK gamers actually rate. Real prices, no BS.',
    canonical:       'https://stackpick.co.uk/headsets/',
    heroTitle:       'Best Gaming Headsets (UK)',
    heroSubtitle:    'From open-back audiophile to wireless premium. Updated Feb 2026.',
    breadcrumbLabel: 'Gaming Headsets',
    buyingGuideHTML: `<h2>The 2026 Headset Guide</h2>
<h3>Open-back vs Closed-back</h3>
<p><strong>Open-back</strong> headphones (like the Sennheiser HD 560S) let sound in and out — creating a wider, more natural soundstage that makes footstep positioning in FPS significantly clearer. The trade-off: everyone nearby can hear your game, and ambient noise bleeds in. <strong>Closed-back</strong> gaming headsets isolate you from the room — better for noisy environments and voice chat.</p>
<h3>Wireless latency — solved</h3>
<p>The days of noticeable wireless audio lag are over. 2.4GHz wireless (used by HyperX, SteelSeries, and Logitech) operates at sub-5ms latency — imperceptible in gaming. The remaining reason to choose wired is budget: wired headsets deliver better hardware per pound at the same price point.</p>
<p class="last-updated"><em>Last updated: February 2026. Prices checked weekly.</em></p>`,
  },

  monitors: {
    emoji:           '🖥️',
    pageTitle:       'Best Gaming Monitors UK 2026 | Stack Pick',
    metaDescription: 'Best gaming monitors for UK gamers 2026. OLED, Mini-LED, and budget IPS picks — verified UK pricing on Amazon.',
    ogTitle:         'Best Gaming Monitors UK 2026 | Stack Pick',
    ogDescription:   'From glossy WOLED to HDR1000 Mini-LED — the monitors UK gamers are actually buying. Real prices, no BS.',
    canonical:       'https://stackpick.co.uk/monitors/',
    heroTitle:       'Best Gaming Monitors (UK)',
    heroSubtitle:    'OLED, Mini-LED, and the budget IPS that punches above its weight. Updated Feb 2026.',
    breadcrumbLabel: 'Gaming Monitors',
    buyingGuideHTML: `<h2>2026 Buying Guide: Glossy, Mini-LED &amp; OLED</h2>
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
    emoji:           '🪑',
    pageTitle:       'Best Gaming Chairs UK 2026 | Stack Pick',
    metaDescription: 'Best gaming chairs for UK gamers 2026. Crowd-researched picks for every type of buyer — from budget to breathable mesh to back pain relief. Verified UK pricing on Amazon.',
    ogTitle:         'Best Gaming Chairs UK 2026 | Stack Pick',
    ogDescription:   'Five chairs for five real problems. Budget, mesh, back pain, comfort, and the best overall — all available on Amazon UK.',
    canonical:       'https://stackpick.co.uk/chairs/',
    heroTitle:       'Best Gaming Chairs UK',
    heroSubtitle:    'Five chairs for five real problems. Crowd-researched picks based on what UK gamers actually ask about. Updated February 2026.',
    breadcrumbLabel: 'Gaming Chairs',
    buyingGuideHTML: `<h2>The 2026 Chair Buying Guide</h2>
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
// Badge colour map — non-default colours only (default = CSS class colour)
// Keyed by product id, matching the id field in collections.json / products.json
// ---------------------------------------------------------------------------
const BADGE_COLORS = {
  // mice
  'mice-razer-viper-v3-pro':                  '#22c55e',
  'mice-endgame-gear-op1w':                   '#3b82f6',
  'mice-atk-vxe-mad-r-plus':                  '#ef4444',
  // keyboards
  'keyboards-aula-f99-wireless':              '#8b5cf6',
  'keyboards-keychron-c3-pro':                '#10b981',
  // monitors
  'monitors-asus-rog-xg27aqdmg':              '#ef4444',
};

// ---------------------------------------------------------------------------
// RRP data — products that show a crossed-out RRP and saving percentage
// Keyed by product id
// ---------------------------------------------------------------------------
const PRICE_RRP = {
  'mice-razer-viper-v3-pro':                  { rrp: '£159.99', saving: 'Save 26%' },
  'mice-razer-deathadder-v3-pro':             { rrp: '£149.99', saving: 'Save 53%' },
  'mice-logitech-g502x-plus':                 { rrp: '£149.99', saving: 'Save 37%' },
  'keyboards-steelseries-apex-pro-tkl-gen3':  { rrp: '£209.99', saving: 'Save 12%' },
  'keyboards-asus-rog-strix-scope-ii-96':     { rrp: '£169.99', saving: 'Save 27%' },
  'keyboards-keychron-c3-pro':                { rrp: '£45.99',  saving: 'Save 13%' },
  'headsets-sennheiser-hd560s':               { rrp: '£169.00', saving: 'Save 41%' },
  'headsets-steelseries-arctis-nova-pro':     { rrp: '£329.99', saving: 'Save 22%' },
  'headsets-hyperx-cloud-iii-s-wireless':     { rrp: '£129.99', saving: 'Save 10%' },
  'headsets-bose-quietcomfort-ultra-gen2':    { rrp: '£449.95', saving: 'Save 11%' },
  'headsets-razer-blackshark-v2-x':           { rrp: '£39.99',  saving: 'Save 11%' },
  'chairs-corsair-tc100-relaxed':             { rrp: '£199.99', saving: 'Save 6%'  },
  'chairs-sihoo-doro-c300':                   { rrp: '£339.99', saving: 'Save 21%' },
  'chairs-noblechairs-hero':                  { rrp: '£399.00', saving: 'Save 12%' },
};

// ---------------------------------------------------------------------------
// Validate all product records required by the generator.
// FIX: 'brand' is now required here and must be present in products.json.
// Returns true if valid, logs warnings and returns false if not.
// ---------------------------------------------------------------------------
const REQUIRED_PRODUCT_FIELDS = [
  'id', 'category', 'brand', 'name', 'badge', 'price', 'priceRaw',
  'inStock', 'affiliate', 'desc', 'emoji', 'pros', 'cons',
];

function validateProduct(p) {
  const errors = [];
  for (const field of REQUIRED_PRODUCT_FIELDS) {
    if (p[field] == null) errors.push(`missing field "${field}"`);
  }
  if (!Array.isArray(p.pros))  errors.push('"pros" must be an array');
  if (!Array.isArray(p.cons))  errors.push('"cons" must be an array');
  if (typeof p.priceRaw !== 'number') errors.push('"priceRaw" must be a number');
  if (typeof p.inStock  !== 'boolean') errors.push('"inStock" must be a boolean');
  if (errors.length) {
    console.warn(`  ⚠️  Product "${p.id || '(unknown id)'}" skipped: ${errors.join(', ')}`);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Build a single product card HTML string
// All user-facing fields are passed through escapeHtml to prevent invalid HTML.
// ---------------------------------------------------------------------------
function buildProductCard(product) {
  const badgeColor = BADGE_COLORS[product.id] || null;
  const rrpData    = PRICE_RRP[product.id]    || null;

  const badgeStyle = badgeColor ? ` style="background:${escapeHtml(badgeColor)};"` : '';

  const rrpBlock = rrpData
    ? `\n              <span class="price-rrp-wrap">` +
      `<span class="price-rrp-label">RRP</span>` +
      `<span class="price-rrp">${escapeHtml(rrpData.rrp)}</span></span>` +
      `<span class="price-saving">${escapeHtml(rrpData.saving)}</span>`
    : '';

  const prosHTML = product.pros.map(p =>
    `              <li class="pro"><span class="pro-icon">✓</span> ${escapeHtml(p)}</li>`
  ).join('\n');

  const consHTML = product.cons.map(c =>
    `              <li class="con"><span class="con-icon">✕</span> ${escapeHtml(c)}</li>`
  ).join('\n');

  return `        <div class="product-card">
          <div class="product-image-placeholder" aria-hidden="true">${escapeHtml(product.emoji)}</div>
          <div class="product-content">
            <span class="product-badge"${badgeStyle}>${escapeHtml(product.badge)}</span>
            <h3 class="product-title">${escapeHtml(product.name)}</h3>
            <div class="product-price-block">
              <span class="price-current-label">Amazon price</span>
              <span class="price-current">${escapeHtml(product.price)}</span>${rrpBlock}
            </div>
            <p class="product-desc">${escapeHtml(product.desc)}</p>
            <ul class="product-features">
${prosHTML}
${consHTML}
            </ul>
            <a href="${escapeHtml(product.affiliate)}" target="_blank" rel="noopener sponsored" class="product-btn">View on Amazon →</a>
          </div>
        </div>`;
}

// ---------------------------------------------------------------------------
// Build schema.org ItemList + BreadcrumbList JSON-LD for a category page
// ---------------------------------------------------------------------------
function buildSchemaJSON(config, products) {
  const itemList = {
    '@context':      'https://schema.org',
    '@type':         'ItemList',
    name:            config.pageTitle.replace(' | Stack Pick', ''),
    url:             config.canonical,
    numberOfItems:   products.length,
    itemListElement: products.map((p, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      item: {
        '@type': 'Product',
        name:    p.name,
        brand:   { '@type': 'Brand', name: p.brand },
        offers:  {
          '@type':       'Offer',
          priceCurrency: 'GBP',
          price:         String(p.priceRaw),
          availability:  p.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',                   item: 'https://stackpick.co.uk/' },
      { '@type': 'ListItem', position: 2, name: config.breadcrumbLabel,   item: config.canonical },
    ],
  };

  const toTag = obj =>
    `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;

  return [itemList, breadcrumb].map(toTag).join('\n');
}

// ---------------------------------------------------------------------------
// Generate one category page
// Products are ordered by their position in the all-picks collection baseProducts
// array, preserving the editorial ranking defined in collections.json.
// ---------------------------------------------------------------------------
function generateCategory(slug, config, productMap, allPicksOrder) {
  // Filter to this category, then sort by editorial order from all-picks
  const ordered = allPicksOrder
    .filter(id => id.startsWith(slug + '-') && productMap.has(id))
    .map(id => productMap.get(id));

  if (ordered.length === 0) {
    console.warn(`  ⚠️  No products found for category "${slug}" — page will render empty.`);
  }

  const productCardsHTML = ordered.map(buildProductCard).join('\n\n');
  const schemaJSON       = buildSchemaJSON(config, ordered);

  const data = {
    // <head> placeholders
    pageTitle:        config.pageTitle,
    metaDescription:  config.metaDescription,
    ogType:           'website',
    ogTitle:          config.ogTitle,
    ogDescription:    config.ogDescription,
    canonical:        config.canonical,
    emoji:            config.emoji,
    schemaJSON,
    // navigation
    activePage:       slug,
    // page content
    heroTitle:        config.heroTitle,
    heroSubtitle:     config.heroSubtitle,
    breadcrumbLabel:  config.breadcrumbLabel,
    // rendered HTML blobs — injected raw, already escaped above
    productCardsHTML,
    buyingGuideHTML:  config.buyingGuideHTML,
  };

  return renderPage({ partialsDir: PARTIALS_DIR, template: TEMPLATE, data });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function run() {
  // Load both data files
  const collections = JSON.parse(fs.readFileSync(COLLECTIONS_FILE, 'utf8'));
  const rawProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));

  // The 'all-picks' collection defines the canonical product universe and
  // editorial ordering used across all category pages.
  const allPicks = collections.find(c => c.id === 'all-picks');
  if (!allPicks) {
    console.error('  ✗ Fatal: "all-picks" collection not found in collections.json');
    process.exit(1);
  }
  const allPicksOrder = allPicks.baseProducts;

  // Validate and index products by id for fast lookup
  const productMap = new Map();
  for (const p of rawProducts) {
    if (validateProduct(p)) {
      productMap.set(p.id, p);
    }
  }

  // Warn about any ID in collections.json that has no corresponding product record
  for (const id of allPicksOrder) {
    if (!productMap.has(id)) {
      console.warn(`  ⚠️  collections.json references "${id}" but no matching product in products.json`);
    }
  }

  let passed = 0;
  let failed = 0;

  for (const [slug, config] of Object.entries(CATEGORY_CONFIG)) {
    try {
      const html       = generateCategory(slug, config, productMap, allPicksOrder);
      const outputPath = path.join(ROOT, slug, 'index.html');
      writeFile(outputPath, html);
      console.log(`  ✓ ${slug}/index.html`);
      passed++;
    } catch (err) {
      console.error(`  ✗ Failed to generate "${slug}/index.html": ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  Generated ${passed} category page(s).${failed ? ` Failed: ${failed}.` : ''}`);
}

// FIX: guard with require.main to prevent auto-execution when imported by build.js
if (require.main === module) {
  run();
}

module.exports = { run };
