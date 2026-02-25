'use strict';

/**
 * StackPick lib/config.js — single source of truth for all shared constants.
 *
 * Previously scattered across:
 *   generate-categories.js  — CATEGORY_CONFIG, BADGE_COLORS, REQUIRED_PRODUCT_FIELDS
 *   generate-comparisons.js — REQUIRED_PRODUCT_FIELDS, REQUIRED_COMPARISON_FIELDS
 *   generate-guides.js      — REQUIRED_PRODUCT_FIELDS, REQUIRED_GUIDE_FIELDS
 *   export-js-data.js       — CATEGORY_EMOJI, CATEGORY_TYPE
 *   validate.js             — VALID_CATEGORIES, VALID_SEAMS, DATE_RE, SPECS_LENGTH, etc.
 *   generate-sitemap.js     — BASE_URL
 */

const path = require('path');

// ---------------------------------------------------------------------------
// Filesystem paths
// ---------------------------------------------------------------------------
const ROOT         = path.join(__dirname, '../..');
const TEMPLATE_DIR = path.join(ROOT, '_templates');
const PARTIALS_DIR = path.join(TEMPLATE_DIR, '_partials');
const DATA_DIR     = path.join(ROOT, '_data');
const JS_DATA_DIR  = path.join(ROOT, 'assets', 'js', 'data');

// ---------------------------------------------------------------------------
// Site constants
// ---------------------------------------------------------------------------
const BASE_URL     = 'https://stackpick.co.uk';

// ---------------------------------------------------------------------------
// Data validation — categories, seams, formats
// ---------------------------------------------------------------------------
const VALID_CATEGORIES = [
  'mice', 'keyboards', 'headsets', 'monitors', 'chairs',
  'desks', 'speakers', 'pcs', 'extras',
];

const VALID_SEAMS = ['crimson', 'cobalt', 'slate', 'amber', 'jade', 'purple'];

const DATE_RE      = /^\d{4}-\d{2}-\d{2}$/;
const SPECS_LENGTH = 3;

// Placeholder stub value written into guides.json affiliate URLs not yet assigned
const TODO_AFFILIATE = 'TODO:REPLACE_WITH_REAL_AFFILIATE_URL';

// ---------------------------------------------------------------------------
// Required product fields — three distinct lists for each use-site
// ---------------------------------------------------------------------------

// Used by validate.js (full schema check — strictest)
const REQUIRED_PRODUCT_FIELDS_VALIDATE = [
  'id', 'category', 'brand', 'badge', 'name', 'shortName',
  'specs', 'desc', 'pros', 'cons',
  'price', 'priceRaw', 'affiliate',
  'url', 'emoji', 'inStock',
];

// Used by the category page generator
const REQUIRED_PRODUCT_FIELDS_CATEGORY = [
  'id', 'category', 'brand', 'name', 'badge', 'price', 'priceRaw',
  'inStock', 'affiliate', 'desc', 'emoji', 'pros', 'cons',
];

// Used by the comparison page generator (per productA / productB object)
const REQUIRED_PRODUCT_FIELDS_COMPARISON = [
  'name', 'badge', 'price', 'affiliate', 'desc',
];

// Used by the guide page generator (per section product object)
const REQUIRED_PRODUCT_FIELDS_GUIDE = [
  'name', 'badge', 'price', 'affiliate', 'desc', 'pros', 'cons',
];

// "Extra" fields that validate.js warns on if absent
const EXTRA_FIELDS = ['seam', 'loadoutCount', 'tags', 'nextDay'];

// ---------------------------------------------------------------------------
// Required fields for comparison and guide data entries
// ---------------------------------------------------------------------------
const REQUIRED_COMPARISON_FIELDS = [
  'slug', 'title', 'metaTitle', 'metaDescription', 'canonical',
  'datePublished', 'emoji',
  'intro', 'productA', 'productB', 'specTable',
  'sections', 'verdict',
];

const REQUIRED_GUIDE_FIELDS = [
  'slug', 'title', 'metaTitle', 'metaDescription',
  'canonical', 'datePublished', 'emoji',
  'heroTitle', 'heroSubtitle', 'breadcrumbLabel',
  'intro', 'summaryTable', 'summaryTotals', 'sections',
];

// ---------------------------------------------------------------------------
// Category emojis — canonical map used by export-js-data search index builder
// ---------------------------------------------------------------------------
const CATEGORY_EMOJI = {
  mice:      '🖱️',
  keyboards: '⌨️',
  headsets:  '🎧',
  monitors:  '🖥️',
  chairs:    '🪑',
  desks:     '🪵',
  speakers:  '🔊',
  pcs:       '💻',
  extras:    '✨',
};

// ---------------------------------------------------------------------------
// Category → search filter type
// Maps data category slugs to the UI filter type strings used in search/index.html
// ---------------------------------------------------------------------------
const CATEGORY_TYPE = {
  mice:      'mouse',
  keyboards: 'keyboard',
  headsets:  'headset',
  monitors:  'monitor',
  chairs:    'chair',
  desks:     'desk',
  speakers:  'speaker',
  pcs:       'pc',
  extras:    'extra',
};

// ---------------------------------------------------------------------------
// Badge colour overrides — keyed by product id.
// Overrides the default CSS class colour for specific product cards on category pages.
// Previously hardcoded in generate-categories.js.
// Products in guides/comparisons use a per-product `badgeColor` field in their JSON.
// ---------------------------------------------------------------------------
const BADGE_COLORS = {
  // mice
  'mice-razer-viper-v3-pro':      '#22c55e',
  'mice-endgame-gear-op1w':       '#3b82f6',
  'mice-atk-vxe-mad-r-plus':      '#ef4444',
  // keyboards
  'keyboards-aula-f99-wireless':  '#8b5cf6',
  'keyboards-keychron-c3-pro':    '#10b981',
  // monitors
  'monitors-asus-rog-xg27aqdmg':  '#ef4444',
};

// ---------------------------------------------------------------------------
// Category page marketing configuration
// Wrapped in a function so BUILD_MONTH is always computed fresh at build time.
// All copy is preserved verbatim from the original generate-categories.js.
// ---------------------------------------------------------------------------
function getCategoryConfig() {
  const BUILD_MONTH       = new Date().toLocaleDateString('en-GB', { month: 'long',  year: 'numeric' });
  const BUILD_MONTH_SHORT = new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return {
    mice: {
      emoji:           '🖱️',
      pageTitle:       'Best Gaming Mice UK 2026 | Stack Pick',
      metaDescription: 'Best gaming mice for UK gamers. From sub-40g "super-clones" to the 8K polling pros use. Verified 2026 UK pricing.',
      ogTitle:         'Best Gaming Mice UK 2026 | Stack Pick',
      ogDescription:   'Stop using heavy, laggy mice. We\'ve researched the best 4K/8K wireless and budget-beating gaming mice in the UK.',
      canonical:       'https://stackpick.co.uk/mice/',
      heroTitle:       'Best Gaming Mice (UK)',
      heroSubtitle:    `From sub-40g "super-clones" to the 8K polling pros use. Updated ${BUILD_MONTH_SHORT}.`,
      breadcrumbLabel: 'Gaming Mice',
      buyingGuideHTML: `<h2>The 2026 Mouse Guide</h2>
<h3>Polling Rate: 1K vs 4K vs 8K</h3>
<p>Standard mice report to your PC 1,000 times per second (1K). In 2026, <strong>4K and 8K polling</strong> report up to 8,000 times. On a 240Hz or 360Hz monitor, this makes mouse movement look significantly smoother and reduces input lag by microseconds.</p>
<h3>Optical vs Mechanical Switches</h3>
<p>Legacy mechanical switches eventually wear out and "double-click." <strong>Optical switches</strong> (like Razer's Gen-3 or Logitech's Lightforce) use a beam of light to register clicks. They are faster and, more importantly, effectively impossible to break.</p>
<p class="last-updated"><em>Last updated: ${BUILD_MONTH}. Prices checked weekly.</em></p>`,
    },

    keyboards: {
      emoji:           '⌨️',
      pageTitle:       'Best Gaming Keyboards UK 2026 | Stack Pick',
      metaDescription: 'Best gaming keyboards for UK gamers 2026. Hall Effect, wireless, and budget mechanical picks — verified UK pricing on Amazon.',
      ogTitle:         'Best Gaming Keyboards UK 2026 | Stack Pick',
      ogDescription:   'From Hall Effect Rapid Trigger to creamy gasket-mount acoustics — the keyboards UK gamers actually buy. Real prices, no BS.',
      canonical:       'https://stackpick.co.uk/keyboards/',
      heroTitle:       'Best Gaming Keyboards (UK)',
      heroSubtitle:    `Hall Effect, wireless, and budget mechanical picks. Updated ${BUILD_MONTH_SHORT}.`,
      breadcrumbLabel: 'Gaming Keyboards',
      buyingGuideHTML: `<h2>The 2026 Buying Guide</h2>
<h3>What is "Rapid Trigger"?</h3>
<p>Standard keyboards actuate at a fixed point. <strong>Hall Effect (HE)</strong> boards like the <strong>Apex Pro</strong> use magnets to track every millimetre. Rapid Trigger resets the key the instant you lift your finger, letting you stop or strafe faster than physically possible on a normal board.</p>
<h3>Why "Creamy" sounds better</h3>
<p>Traditional "Clicky" keyboards are loud and hollow. "Creamy" boards like the <strong>Aula F99</strong> use pre-lubed switches and gasket mounts to dampen vibrations, creating a deep, satisfying "thock" sound that feels much more premium.</p>
<p class="last-updated"><em>Last updated: ${BUILD_MONTH}. Prices checked weekly.</em></p>`,
    },

    headsets: {
      emoji:           '🎧',
      pageTitle:       'Best Gaming Headsets UK 2026 | Stack Pick',
      metaDescription: 'Best gaming headsets for UK gamers 2026. From audiophile open-back to wireless premium — verified UK pricing on Amazon.',
      ogTitle:         'Best Gaming Headsets UK 2026 | Stack Pick',
      ogDescription:   'From £40 wired picks to premium wireless with hot-swap batteries — the headsets UK gamers actually rate. Real prices, no BS.',
      canonical:       'https://stackpick.co.uk/headsets/',
      heroTitle:       'Best Gaming Headsets (UK)',
      heroSubtitle:    `From open-back audiophile to wireless premium. Updated ${BUILD_MONTH_SHORT}.`,
      breadcrumbLabel: 'Gaming Headsets',
      buyingGuideHTML: `<h2>The 2026 Headset Guide</h2>
<h3>Open-back vs Closed-back</h3>
<p><strong>Open-back</strong> headphones (like the Sennheiser HD 560S) let sound in and out — creating a wider, more natural soundstage that makes footstep positioning in FPS significantly clearer. The trade-off: everyone nearby can hear your game, and ambient noise bleeds in. <strong>Closed-back</strong> gaming headsets isolate you from the room — better for noisy environments and voice chat.</p>
<h3>Wireless latency — solved</h3>
<p>The days of noticeable wireless audio lag are over. 2.4GHz wireless (used by HyperX, SteelSeries, and Logitech) operates at sub-5ms latency — imperceptible in gaming. The remaining reason to choose wired is budget: wired headsets deliver better hardware per pound at the same price point.</p>
<p class="last-updated"><em>Last updated: ${BUILD_MONTH}. Prices checked weekly.</em></p>`,
    },

    monitors: {
      emoji:           '🖥️',
      pageTitle:       'Best Gaming Monitors UK 2026 | Stack Pick',
      metaDescription: 'Best gaming monitors for UK gamers 2026. OLED, Mini-LED, and budget IPS picks — verified UK pricing on Amazon.',
      ogTitle:         'Best Gaming Monitors UK 2026 | Stack Pick',
      ogDescription:   'From glossy WOLED to HDR1000 Mini-LED — the monitors UK gamers are actually buying. Real prices, no BS.',
      canonical:       'https://stackpick.co.uk/monitors/',
      heroTitle:       'Best Gaming Monitors (UK)',
      heroSubtitle:    `OLED, Mini-LED, and the budget IPS that punches above its weight. Updated ${BUILD_MONTH_SHORT}.`,
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
<p class="last-updated"><em>Last updated: ${BUILD_MONTH}. Prices checked daily.</em></p>`,
    },

    chairs: {
      emoji:           '🪑',
      pageTitle:       'Best Gaming Chairs UK 2026 | Stack Pick',
      metaDescription: 'Best gaming chairs for UK gamers 2026. Crowd-researched picks for every type of buyer — from budget to breathable mesh to back pain relief. Verified UK pricing on Amazon.',
      ogTitle:         'Best Gaming Chairs UK 2026 | Stack Pick',
      ogDescription:   'Five chairs for five real problems. Budget, mesh, back pain, comfort, and the best overall — all available on Amazon UK.',
      canonical:       'https://stackpick.co.uk/chairs/',
      heroTitle:       'Best Gaming Chairs UK',
      heroSubtitle:    `Five chairs for five real problems. Crowd-researched picks based on what UK gamers actually ask about. Updated ${BUILD_MONTH}.`,
      breadcrumbLabel: 'Gaming Chairs',
      buyingGuideHTML: `<h2>The 2026 Chair Buying Guide</h2>
<h3>Gaming chair vs office chair — honest answer</h3>
<p>This is the most debated question across r/battlestations, r/pcmasterrace and every gaming Discord. The honest answer: at the budget end (under £200), gaming chairs tend to beat office chairs for comfort and build quality. Once you're spending £300+, ergonomic design matters more than aesthetics, and purpose-built ergonomic chairs like the Sihoo Doro C300 will do more for your back than any racing-style bucket seat.</p>
<h3>What actually matters for long sessions</h3>
<p>Lumbar support is the single most important factor for anyone sitting more than 3 hours at a stretch. Look for adjustable lumbar that moves with you — not just a fixed cushion. After that, seat depth matters more than most people realise: your back should touch the rest while your feet sit flat on the floor. Armrests that actually adjust to your desk height make a bigger difference than any other spec.</p>
<h3>Leather vs mesh — the real difference</h3>
<p>PU leatherette looks great and feels premium out of the box, but gets hot in summer and typically starts cracking after 2–3 years of heavy use. Mesh breathes significantly better and tends to age more gracefully — but can feel firmer. If you run hot or game in a warm room, mesh is worth the switch. The Eureka Typhon and Sihoo Doro C300 are both full mesh and fix the sweaty chair problem entirely.</p>
<h3>How we picked these</h3>
<p>We cross-referenced Reddit\'s r/battlestations, r/pcmasterrace and dedicated chair communities with hands-on reviews from PC Gamer, TechRadar and Tom\'s Guide, then filtered by what\'s actually available and priced honestly on Amazon UK. No grey imports, no US-only stock. Prices are checked weekly.</p>
<p class="last-updated"><em>Last updated: ${BUILD_MONTH}. Prices checked weekly.</em></p>`,
    },
  };
}

// ---------------------------------------------------------------------------
module.exports = {
  ROOT,
  TEMPLATE_DIR,
  PARTIALS_DIR,
  DATA_DIR,
  JS_DATA_DIR,
  BASE_URL,
  VALID_CATEGORIES,
  VALID_SEAMS,
  DATE_RE,
  SPECS_LENGTH,
  TODO_AFFILIATE,
  REQUIRED_PRODUCT_FIELDS_VALIDATE,
  REQUIRED_PRODUCT_FIELDS_CATEGORY,
  REQUIRED_PRODUCT_FIELDS_COMPARISON,
  REQUIRED_PRODUCT_FIELDS_GUIDE,
  EXTRA_FIELDS,
  REQUIRED_COMPARISON_FIELDS,
  REQUIRED_GUIDE_FIELDS,
  CATEGORY_EMOJI,
  CATEGORY_TYPE,
  BADGE_COLORS,
  getCategoryConfig,
};
