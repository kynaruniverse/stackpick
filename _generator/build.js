'use strict';

/**
 * StackPick build.js — the Boss. The single entry point for the entire build.
 *
 * Usage:  node _generator/build.js   |   npm run build
 *
 * Previously, this file only orchestrated 5 separate generator scripts.
 * After the Force Marry consolidation, those scripts are gone. All generation
 * logic now lives inline here, backed by shared modules in lib/:
 *
 *   lib/config.js  — all constants and CATEGORY_CONFIG
 *   lib/utils.js   — loadJSON(), writeFile()
 *   lib/schema.js  — schema.org JSON-LD builders
 *   lib/render.js  — template engine, paragraphs(), buildProductCard()
 *   lib/validate.js — data validation (unchanged)
 *
 * Build steps:
 *   0.  Clean old build artifacts
 *   1.  Validate all _data/*.json
 *   2.  Stamp CSP nonce into _headers and head.html partial
 *   3.  Generate category pages (mice, keyboards, headsets, monitors, chairs)
 *   4.  Generate comparison pages
 *   5.  Generate guide pages
 *   6.  Generate sitemap.xml
 *   7.  Export assets/js/data/*.js (products, collections, search-index)
 *   8.  Stamp sw.js with build-time version   [BUG FIX: now matches __SP_VERSION__ placeholder]
 *   9.  Restore __CSP_NONCE__ placeholders in source files
 */

const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');

// ── lib imports ─────────────────────────────────────────────────────────────
const {
  ROOT, TEMPLATE_DIR, PARTIALS_DIR, DATA_DIR, JS_DATA_DIR,
  BASE_URL, VALID_CATEGORIES, CATEGORY_EMOJI, CATEGORY_TYPE,
  REQUIRED_PRODUCT_FIELDS_CATEGORY,
  REQUIRED_PRODUCT_FIELDS_COMPARISON,
  REQUIRED_PRODUCT_FIELDS_GUIDE,
  getCategoryConfig,
} = require('./lib/config');

const { loadJSON, writeFile }                                 = require('./lib/utils');
const { escapeHtml, paragraphs, buildProductCard, renderPage } = require('./lib/render');
const {
  buildCategorySchemaJSON,
  buildComparisonSchemaJSON,
  buildGuideSchemaJSON,
}                                                             = require('./lib/schema');
const { runValidation }                                       = require('./lib/validate');

const start = Date.now();
console.log('\n🔨 StackPick build starting...\n');

// ===========================================================================
// STEP 0 — Clean old build artifacts
// ===========================================================================
console.log('Step 0 — Cleaning old build files...');

const dirsToClean = [
  'mice', 'keyboards', 'headsets', 'monitors', 'chairs',
  'desks', 'speakers', 'pcs', 'extras',
];

dirsToClean.forEach(dir => {
  const fullPath = path.join(ROOT, dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

const filesToClean = [
  path.join(ROOT, 'sitemap.xml'),
  path.join(JS_DATA_DIR, 'products.js'),
  path.join(JS_DATA_DIR, 'collections.js'),
  path.join(JS_DATA_DIR, 'search-index.js'),
];

filesToClean.forEach(file => {
  if (fs.existsSync(file)) fs.unlinkSync(file);
});

// Clean slug subdirs inside comparisons/ and guides/ (keep the parent folder)
['comparisons', 'guides'].forEach(parent => {
  const parentPath = path.join(ROOT, parent);
  if (fs.existsSync(parentPath)) {
    fs.readdirSync(parentPath).forEach(item => {
      const itemPath = path.join(parentPath, item);
      if (fs.lstatSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      }
    });
  }
});

// ===========================================================================
// STEP 1 — Validate data
// ===========================================================================
console.log('\nStep 1 — Validating data...');
const valid = runValidation();
if (!valid) {
  console.error('Build aborted: fix validation errors above.\n');
  process.exit(1);
}

// ===========================================================================
// STEP 2 — Stamp CSP nonce into _headers and head.html partial
//
// Source files use __CSP_NONCE__ placeholder. This step replaces it with a
// fresh random nonce for this build. Step 9 restores the placeholder so
// source files stay clean for git.
// ===========================================================================
console.log('\nStep 2 — Stamping CSP nonce...');

const nonce       = crypto.randomBytes(16).toString('base64');
const headersPath = path.join(ROOT, '_headers');
const headPath    = path.join(ROOT, '_templates', '_partials', 'head.html');

try {
  let headersContent = fs.readFileSync(headersPath, 'utf8');
  if (!headersContent.includes('__CSP_NONCE__')) {
    throw new Error(
      '_headers is missing the __CSP_NONCE__ placeholder.\n' +
      'It may have been accidentally committed with a live nonce baked in.\n' +
      'Restore the placeholder: replace the nonce-<value> token with nonce-__CSP_NONCE__'
    );
  }
  headersContent = headersContent.replace(/__CSP_NONCE__/g, nonce);
  fs.writeFileSync(headersPath, headersContent, 'utf8');

  let headContent = fs.readFileSync(headPath, 'utf8');
  if (!headContent.includes('__CSP_NONCE__')) {
    throw new Error(
      'head.html is missing the __CSP_NONCE__ placeholder.\n' +
      'It may have been accidentally committed with a live nonce baked in.\n' +
      'Restore the placeholder: replace nonce="<value>" with nonce="__CSP_NONCE__"'
    );
  }
  headContent = headContent.replace(/__CSP_NONCE__/g, nonce);
  fs.writeFileSync(headPath, headContent, 'utf8');

  console.log('   🔑 CSP nonce stamped');
} catch (err) {
  console.error('Step 2 failed:', err.message);
  process.exit(1);
}

// ===========================================================================
// STEP 3 — Generate category pages
// ===========================================================================
console.log('\nStep 3 — Generating category pages...');

(function generateCategories() {
  const CATEGORY_CONFIG = getCategoryConfig();
  const TEMPLATE = fs.readFileSync(path.join(TEMPLATE_DIR, 'category.html'), 'utf8');

  // Load data
  const collections = loadJSON('collections.json');
  const rawProducts = loadJSON('products.json');

  // The 'all-picks' collection defines the canonical product universe and editorial ordering
  const allPicks = collections.find(c => c.id === 'all-picks');
  if (!allPicks) {
    throw new Error('Fatal: "all-picks" collection not found in collections.json');
  }
  const allPicksOrder = allPicks.baseProducts;

  // Validate and index products by id.
  // NOTE: Full schema validation already ran in Step 1. This pass is a lightweight
  // guard to skip products that are missing fields the generator strictly requires,
  // preventing a crash mid-build if data is partially malformed after Step 1 passes.
  function productIsUsable(p) {
    for (const field of REQUIRED_PRODUCT_FIELDS_CATEGORY) {
      if (p[field] == null) {
        console.warn(`  ⚠️  Product "${p.id || '(unknown)'}": missing field "${field}" — skipped from category pages`);
        return false;
      }
    }
    if (!Array.isArray(p.pros) || !Array.isArray(p.cons)) {
      console.warn(`  ⚠️  Product "${p.id}": pros/cons must be arrays — skipped`);
      return false;
    }
    if (typeof p.priceRaw  !== 'number') { console.warn(`  ⚠️  Product "${p.id}": priceRaw must be a number — skipped`); return false; }
    if (typeof p.inStock   !== 'boolean') { console.warn(`  ⚠️  Product "${p.id}": inStock must be a boolean — skipped`); return false; }
    return true;
  }

  const productMap = new Map();
  for (const p of rawProducts) {
    if (productIsUsable(p)) productMap.set(p.id, p);
  }

  // Warn about IDs in collections.json with no matching product
  for (const id of allPicksOrder) {
    if (!productMap.has(id)) {
      console.warn(`  ⚠️  collections.json references "${id}" but no matching product in products.json`);
    }
  }

  // Warn about categories with products but no page config
  const allCats = [...new Set(rawProducts.map(p => p.category))];
  allCats.forEach(cat => {
    if (!CATEGORY_CONFIG[cat]) {
      const count = rawProducts.filter(p => p.category === cat).length;
      console.warn(`  ⚠  No page config for category "${cat}" — ${count} product(s) will not get a category page`);
    }
  });

  let passed = 0;
  let failed = 0;

  for (const [slug, config] of Object.entries(CATEGORY_CONFIG)) {
    try {
      // Filter to this category, preserving editorial order from all-picks
      const ordered = allPicksOrder
        .filter(id => id.startsWith(slug + '-') && productMap.has(id))
        .map(id => productMap.get(id));

      if (ordered.length === 0) {
        console.warn(`  ⚠️  No products found for category "${slug}" — page will render empty.`);
      }

      const productCardsHTML = ordered.map(p => buildProductCard(p, { showEmoji: true })).join('\n\n');
      const schemaJSON       = buildCategorySchemaJSON(config, ordered);

      const data = {
        pageTitle:       config.pageTitle,
        metaDescription: config.metaDescription,
        ogType:          'website',
        ogTitle:         config.ogTitle,
        ogDescription:   config.ogDescription,
        canonical:       config.canonical,
        emoji:           config.emoji,
        schemaJSON,
        activePage:      slug,
        heroTitle:       config.heroTitle,
        heroSubtitle:    config.heroSubtitle,
        breadcrumbLabel: config.breadcrumbLabel,
        productCardsHTML,
        buyingGuideHTML: config.buyingGuideHTML,
      };

      const html = renderPage({ partialsDir: PARTIALS_DIR, template: TEMPLATE, data });
      writeFile(path.join(ROOT, slug, 'index.html'), html);
      console.log(`  ✓ ${slug}/index.html`);
      passed++;
    } catch (err) {
      console.error(`  ✗ Failed to generate "${slug}/index.html": ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  Generated ${passed} category page(s).${failed ? ` Failed: ${failed}.` : ''}`);
}());

// ===========================================================================
// STEP 4 — Generate comparison pages
// ===========================================================================
console.log('\nStep 4 — Generating comparison pages...');

(function generateComparisons() {
  const TEMPLATE  = fs.readFileSync(path.join(TEMPLATE_DIR, 'comparison.html'), 'utf8');
  const comparisons = loadJSON('comparisons.json');

  // ── Block builders ─────────────────────────────────────────────────────

  function buildIntroHTML(comp) {
    return `<h2>Quick Answer</h2>\n${paragraphs(comp.intro)}`;
  }

  function buildSpecTableHTML(specTable) {
    return specTable.map(({ label, a, b, winner }) => {
      const tdA = winner === 'a'
        ? `<td class="comparison-winner">${escapeHtml(a)}</td>`
        : `<td>${escapeHtml(a)}</td>`;
      const tdB = winner === 'b'
        ? `<td class="comparison-winner">${escapeHtml(b)}</td>`
        : `<td>${escapeHtml(b)}</td>`;
      return `<tr><td>${escapeHtml(label)}</td>${tdA}${tdB}</tr>`;
    }).join('\n');
  }

  function buildSectionsHTML(sections) {
    return sections.map(({ heading, body }) =>
      `<h3>${escapeHtml(heading)}</h3>\n${paragraphs(body)}`
    ).join('\n\n');
  }

  function buildBuyCardsHTML({ productA, productB, buySection }) {
    const heading = buySection && buySection.heading
      ? `<h2>${escapeHtml(buySection.heading)}</h2>`
      : '<h2>Which should you buy?</h2>';

    function card(product, buy) {
      const badgeStyle = product.badgeColor
        ? ` style="background:${escapeHtml(product.badgeColor)};"`
        : '';
      const points = (buy && buy.points ? buy.points : [])
        .map(pt => `<li>${escapeHtml(pt)}</li>`)
        .join('');
      const buyHeading = buy && buy.heading
        ? `<h3>${escapeHtml(buy.heading)}</h3>`
        : '';

      return `<div class="product-card">
  <div class="product-content">
    <span class="product-badge"${badgeStyle}>${escapeHtml(product.badge)}</span>
    <h3 class="product-title">${escapeHtml(product.name)}</h3>
    <div class="product-price-block">
      <span class="price-current-label">Amazon price</span>
      <span class="price-current">${escapeHtml(product.price)}</span>
    </div>
    <p class="product-desc">${escapeHtml(product.desc || '')}</p>
    ${buyHeading}${points ? `<ul class="buy-reasons">${points}</ul>` : ''}
    <a href="${escapeHtml(product.affiliate)}" target="_blank" rel="noopener sponsored" class="product-btn">${escapeHtml(product.linkLabel || 'View on Amazon \u2192')}</a>
    ${product.linkHref ? `<a href="${escapeHtml(product.linkHref)}" class="product-link">${escapeHtml(product.secondaryLabel || 'See full specs \u2192')}</a>` : ''}
  </div>
</div>`;
    }

    return `${heading}\n<div class="buy-cards">\n${card(productA, buySection && buySection.buyA)}\n${card(productB, buySection && buySection.buyB)}\n</div>`;
  }

  function buildVerdictHTML(verdict) {
    return paragraphs(verdict);
  }

  function buildRelatedLinksHTML(relatedLinks) {
    if (!relatedLinks || !relatedLinks.length) return '';
    const links = relatedLinks
      .map(({ href, label }) =>
        `<a href="${escapeHtml(href)}" class="category-card" style="text-decoration:none;">
  <div class="category-icon">&#9878;&#65039;</div>
  <h3>${escapeHtml(label)}</h3>
</a>`
      )
      .join('\n');
    return `<h2>Explore More</h2>\n<div class="category-grid" style="margin-top:1rem;">\n${links}\n</div>`;
  }

  // ── Validation ───────────────────────────────────────────────────────────

  function validate(comp) {
    const errors = [];
    const REQUIRED = [
      'slug', 'title', 'metaTitle', 'metaDescription', 'canonical',
      'datePublished', 'intro', 'specTable', 'sections', 'verdict',
      'productA', 'productB',
    ];
    for (const field of REQUIRED) {
      if (comp[field] == null) errors.push(`Missing required field: "${field}"`);
    }
    for (const [key, product] of [['productA', comp.productA], ['productB', comp.productB]]) {
      if (!product) continue;
      for (const field of REQUIRED_PRODUCT_FIELDS_COMPARISON) {
        if (product[field] == null) errors.push(`Missing ${key}.${field}`);
      }
    }
    if (errors.length) {
      console.warn(`\n  ⚠️  Validation errors in "${comp.slug}":`);
      errors.forEach(e => console.warn(`     - ${e}`));
    }
    return errors.length === 0;
  }

  // ── Generation loop ──────────────────────────────────────────────────────

  let passed = 0;
  let failed = 0;

  for (const comp of comparisons) {
    if (!validate(comp)) { failed++; continue; }

    try {
      const data = {
        pageTitle:        comp.metaTitle,
        metaDescription:  comp.metaDescription,
        ogType:           'article',
        ogTitle:          comp.ogTitle       || comp.metaTitle,
        ogDescription:    comp.ogDescription || comp.metaDescription,
        canonical:        comp.canonical,
        emoji:            comp.emoji         || '\u2696\uFE0F',
        datePublished:    comp.datePublished,
        dateModified:     comp.dateModified  || comp.datePublished,
        schemaJSON:       buildComparisonSchemaJSON(comp),
        activePage:       'comparisons',
        heroTitle:        comp.heroTitle     || comp.title,
        heroSubtitle:     comp.heroSubtitle  || '',
        breadcrumbLabel:  comp.breadcrumbLabel || comp.title,
        productAName:     comp.productA.name,
        productBName:     comp.productB.name,
        introHTML:        buildIntroHTML(comp),
        specTableHTML:    buildSpecTableHTML(comp.specTable),
        sectionsHTML:     buildSectionsHTML(comp.sections),
        buyCardsHTML:     buildBuyCardsHTML(comp),
        verdictHTML:      buildVerdictHTML(comp.verdict),
        relatedLinksHTML: buildRelatedLinksHTML(comp.relatedLinks),
      };

      const html = renderPage({ partialsDir: PARTIALS_DIR, template: TEMPLATE, data });
      writeFile(path.join(ROOT, 'comparisons', comp.slug, 'index.html'), html);
      console.log(`  ✓ comparisons/${comp.slug}/index.html`);
      passed++;
    } catch (err) {
      console.error(`  ✗ Failed to generate "comparisons/${comp.slug}/index.html": ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  Generated ${passed} comparison page(s).${failed ? ` Skipped ${failed} with errors.` : ''}`);
}());

// ===========================================================================
// STEP 5 — Generate guide pages
// ===========================================================================
console.log('\nStep 5 — Generating guide pages...');

(function generateGuides() {
  const TEMPLATE = fs.readFileSync(path.join(TEMPLATE_DIR, 'guide.html'), 'utf8');
  const guides   = loadJSON('guides.json');

  // ── Validation ───────────────────────────────────────────────────────────

  function validateGuide(guide) {
    const errors = [];
    const REQUIRED = [
      'slug', 'title', 'metaTitle', 'metaDescription', 'canonical',
      'datePublished', 'heroTitle', 'heroSubtitle', 'breadcrumbLabel',
      'intro', 'summaryTable', 'summaryTotals', 'sections',
    ];
    for (const f of REQUIRED) {
      if (guide[f] == null) errors.push(`missing field "${f}"`);
    }
    if (!Array.isArray(guide.summaryTable))  errors.push('"summaryTable" must be an array');
    if (!Array.isArray(guide.summaryTotals)) errors.push('"summaryTotals" must be an array');
    if (!Array.isArray(guide.sections))      errors.push('"sections" must be an array');

    (guide.sections || []).forEach((sec, si) => {
      if (!sec.heading) errors.push(`sections[${si}] missing heading`);
      if (!Array.isArray(sec.products) || sec.products.length === 0) {
        errors.push(`sections[${si}] has no products`);
      }
      (sec.products || []).forEach((p, pi) => {
        for (const f of REQUIRED_PRODUCT_FIELDS_GUIDE) {
          if (p[f] == null) errors.push(`sections[${si}].products[${pi}] ("${p.name || '?'}") missing "${f}"`);
        }
      });
    });

    if (errors.length) {
      console.warn(`  ⚠️  Guide "${guide.slug}" skipped — ${errors.length} error(s):`);
      errors.forEach(e => console.warn(`       - ${e}`));
      return false;
    }
    return true;
  }

  // ── Block builders ─────────────────────────────────────────────────────

  function buildSummaryTableHTML(summaryTable) {
    return summaryTable.map(row =>
      `              <tr>
                <td>${escapeHtml(row.emoji || '')} ${escapeHtml(row.category)}</td>
                <td>${escapeHtml(row.pick)}</td>
                <td><strong>${escapeHtml(row.price)}</strong></td>
              </tr>`
    ).join('\n');
  }

  function buildSummaryTotalsHTML(summaryTotals) {
    if (!summaryTotals || summaryTotals.length === 0) return '';
    return summaryTotals.map(t =>
      `        <p style="text-align:right;font-size:0.9rem;margin-top:0.5rem;font-weight:600;">${escapeHtml(t.label)}: ${escapeHtml(t.value)}</p>`
    ).join('\n');
  }

  function buildSectionsHTML(sections) {
    return sections.map(section => {
      const introP   = section.intro ? `        <p>${escapeHtml(section.intro)}</p>` : '';
      // Guide product cards use showEmoji: false (no image placeholder)
      const cardsHTML = section.products.map(p => buildProductCard(p, { showEmoji: false })).join('\n\n');
      return `      <section class="section">
        <div class="section-title">
          <h2>${escapeHtml(section.heading)}</h2>
        </div>
${introP}
        <div class="product-grid">
${cardsHTML}
        </div>
      </section>`;
    }).join('\n\n');
  }

  function buildBuyingGuideHTML(buyingGuide) {
    if (!buyingGuide) return '';
    const heading = buyingGuide.heading
      ? `          <h2>${escapeHtml(buyingGuide.heading)}</h2>\n`
      : '';
    // paragraphs() from lib/render.js replaces the inline reimplementation
    const paras = paragraphs(buyingGuide.body || '', '          ');
    return `${heading}${paras}`;
  }

  function buildRelatedGuidesHTML(relatedGuides) {
    if (!relatedGuides || relatedGuides.length === 0) return '';
    return relatedGuides.map(g =>
      `          <a href="${escapeHtml(g.href)}" class="category-card">
            <div class="category-icon">${escapeHtml(g.emoji || '\uD83D\uDCCB')}</div>
            <h3>${escapeHtml(g.title)}</h3>
            <p>${escapeHtml(g.desc)}</p>
          </a>`
    ).join('\n');
  }

  // ── Generation loop ──────────────────────────────────────────────────────

  let passed = 0;
  let failed = 0;

  for (const guide of guides) {
    if (!validateGuide(guide)) { failed++; continue; }

    try {
      const data = {
        pageTitle:         guide.metaTitle,
        metaDescription:   guide.metaDescription,
        ogType:            'article',
        ogTitle:           guide.ogTitle       || guide.metaTitle,
        ogDescription:     guide.ogDescription || guide.metaDescription,
        canonical:         guide.canonical,
        emoji:             guide.emoji         || '\uD83D\uDCCB',
        datePublished:     guide.datePublished,
        dateModified:      guide.dateModified  || guide.datePublished,
        schemaJSON:        buildGuideSchemaJSON(guide),
        activePage:        'guides',
        heroTitle:         guide.heroTitle,
        heroSubtitle:      guide.heroSubtitle,
        breadcrumbLabel:   guide.breadcrumbLabel,
        budgetLabel:       guide.budgetLabel   || '',
        intro:             escapeHtml(guide.intro || ''),
        summaryTableHTML:  buildSummaryTableHTML(guide.summaryTable),
        summaryTotalsHTML: buildSummaryTotalsHTML(guide.summaryTotals),
        sectionsHTML:      buildSectionsHTML(guide.sections),
        buyingGuideHTML:   buildBuyingGuideHTML(guide.buyingGuide),
        relatedGuidesHTML: buildRelatedGuidesHTML(guide.relatedGuides),
      };

      const html = renderPage({ partialsDir: PARTIALS_DIR, template: TEMPLATE, data });
      writeFile(path.join(ROOT, 'guides', guide.slug, 'index.html'), html);
      console.log(`  ✓ guides/${guide.slug}/index.html`);
      passed++;
    } catch (err) {
      console.error(`  ✗ Failed to generate "${guide.slug}": ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  Generated ${passed} guide page(s).${failed ? ` Failed: ${failed}.` : ''}`);
}());

// ===========================================================================
// STEP 6 — Generate sitemap.xml
// ===========================================================================
console.log('\nStep 6 — Generating sitemap.xml...');

(function generateSitemap() {
  const TODAY       = new Date().toISOString().split('T')[0];
  const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  function escapeXml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&apos;');
  }

  function safeDate(date, fallback) {
    return (date && ISO_DATE_RE.test(date)) ? date : (fallback || TODAY);
  }

  // Static pages — order matters (priority high to low)
  // NOTE: pages marked placeholder:true are "coming soon" sections included at
  // low priority so Google discovers them early. Update/remove once live.
  const STATIC_PAGES = [
    { loc: '/',             changefreq: 'daily',   priority: '1.0' },
    { loc: '/mice/',        changefreq: 'weekly',  priority: '0.9' },
    { loc: '/keyboards/',   changefreq: 'weekly',  priority: '0.9' },
    { loc: '/headsets/',    changefreq: 'weekly',  priority: '0.9' },
    { loc: '/monitors/',    changefreq: 'weekly',  priority: '0.9' },
    { loc: '/chairs/',      changefreq: 'weekly',  priority: '0.9' },
    { loc: '/guides/',      changefreq: 'weekly',  priority: '0.8' },
    { loc: '/comparisons/', changefreq: 'weekly',  priority: '0.7' },
    { loc: '/search/',      changefreq: 'weekly',  priority: '0.6' },
    { loc: '/about/',       changefreq: 'monthly', priority: '0.5' },
  ];

  function urlBlock(loc, changefreq, priority, lastmod) {
    const p = parseFloat(priority);
    const safePriority = (!isNaN(p) && p >= 0.0 && p <= 1.0) ? priority : '0.5';
    return [
      '  <url>',
      `    <loc>${escapeXml(BASE_URL)}${escapeXml(loc)}</loc>`,
      `    <lastmod>${safeDate(lastmod)}</lastmod>`,
      `    <changefreq>${escapeXml(changefreq)}</changefreq>`,
      `    <priority>${escapeXml(safePriority)}</priority>`,
      '  </url>',
    ].join('\n');
  }

  const comparisons = loadJSON('comparisons.json');
  const guides      = loadJSON('guides.json');

  const blocks = [];

  for (const p of STATIC_PAGES) {
    blocks.push(urlBlock(p.loc, p.changefreq, p.priority));
  }

  for (const guide of guides) {
    blocks.push(urlBlock(
      `/guides/${guide.slug}/`, 'monthly', '0.8',
      safeDate(guide.dateModified || guide.datePublished)
    ));
  }

  for (const comp of comparisons) {
    blocks.push(urlBlock(
      `/comparisons/${comp.slug}/`, 'monthly', '0.7',
      safeDate(comp.dateModified || comp.datePublished)
    ));
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...blocks,
    '</urlset>',
    '',
  ].join('\n');

  const outPath = path.join(ROOT, 'sitemap.xml');
  try {
    fs.writeFileSync(outPath, xml, 'utf8');
  } catch (err) {
    throw new Error(`Failed to write "${outPath}": ${err.message}`);
  }

  const total = STATIC_PAGES.length + guides.length + comparisons.length;
  console.log(`  ✓ sitemap.xml — ${total} URLs`);
}());

// ===========================================================================
// STEP 7 — Export assets/js/data/*.js
// ===========================================================================
console.log('\nStep 7 — Exporting JS data files...');

(function exportJsData() {
  // Ensure output directory exists
  try {
    fs.mkdirSync(JS_DATA_DIR, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create output directory "${JS_DATA_DIR}": ${err.message}`);
  }

  // Single timestamp so all three output files are consistent
  const timestamp = new Date().toISOString();

  function buildHeader(globalVar, sourceFiles) {
    const sources = Array.isArray(sourceFiles) ? sourceFiles.join(', ') : sourceFiles;
    return [
      '// ============================================================',
      `//  AUTO-GENERATED by _generator/build.js`,
      `//  DO NOT EDIT — edit _data/${sources} instead`,
      `//  Generated: ${timestamp}`,
      '//  StackPick v2 — Force Marry design system',
      '// ============================================================',
      '',
      '/* global window */',
      `window.${globalVar} =`,
    ].join('\n');
  }

  function writeOutput(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (err) {
      throw new Error(`Failed to write "${filePath}": ${err.message}`);
    }
  }

  let passed  = 0;
  let failed  = 0;
  let products = null;

  // ── products.js ─────────────────────────────────────────────────────────
  try {
    products = loadJSON('products.json');
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('products.json is empty or not an array');
    }
    const js = `${buildHeader('SP_PRODUCTS', 'products.json')}\n${JSON.stringify(products, null, 2)};\n`;
    writeOutput(path.join(JS_DATA_DIR, 'products.js'), js);
    console.log(`  ✓ assets/js/data/products.js (${products.length} products)`);
    passed++;
  } catch (err) {
    console.error(`  ✗ Failed to export products.js: ${err.message}`);
    failed++;
  }

  // ── collections.js ──────────────────────────────────────────────────────
  try {
    const collections = loadJSON('collections.json');
    if (!Array.isArray(collections) || collections.length === 0) {
      throw new Error('collections.json is empty or not an array');
    }
    const js = `${buildHeader('SP_COLLECTIONS', 'collections.json')}\n${JSON.stringify(collections, null, 2)};\n`;
    writeOutput(path.join(JS_DATA_DIR, 'collections.js'), js);
    console.log(`  ✓ assets/js/data/collections.js (${collections.length} collections)`);
    passed++;
  } catch (err) {
    console.error(`  ✗ Failed to export collections.js: ${err.message}`);
    failed++;
  }

  // ── search-index.js ─────────────────────────────────────────────────────
  try {
    // If products export failed, load directly so search index can still build
    if (!products) {
      products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
    }

    const comparisons = loadJSON('comparisons.json');
    const guides      = loadJSON('guides.json');
    const entries     = [];

    // Products
    products.forEach(p => {
      const type = CATEGORY_TYPE[p.category] || p.category;
      const icon = p.emoji || CATEGORY_EMOJI[p.category] || '\uD83C\uDFAE';
      const url  = `/${p.category}/`;
      const tags = [
        p.brand, p.name, p.shortName, p.category, type,
        ...(p.specs || []), ...(p.tags || []),
        ...(p.pros  || []), ...(p.cons || []),
      ].filter(Boolean).join(' ').toLowerCase();
      entries.push({ type, icon, title: p.name, desc: p.desc, price: p.price, url, tags });
    });

    // Comparisons
    comparisons.forEach(c => {
      const url  = `/comparisons/${c.slug}/`;
      const tags = [
        c.title,
        c.metaDescription || '',
        c.intro           || '',
        c.productA ? c.productA.name : '',
        c.productB ? c.productB.name : '',
        ...(c.specTable || []).map(row => `${row.a} ${row.b}`),
      ].filter(Boolean).join(' ').toLowerCase();
      entries.push({
        type:  'comparison',
        icon:  c.emoji || '\u2696\uFE0F',
        title: c.title,
        desc:  c.metaDescription || c.intro || '',
        price: null,
        url,
        tags,
      });
    });

    // Guides
    // FIX: guides.json uses "budgetLabel", not "budget". Using g.budget was always
    // undefined, silently dropping price from search index entries. Fixed here.
    guides.forEach(g => {
      const url = `/guides/${g.slug}/`;
      const sectionProductNames = [];
      if (Array.isArray(g.sections)) {
        g.sections.forEach(s => {
          if (Array.isArray(s.products)) {
            s.products.forEach(p => { if (p.name) sectionProductNames.push(p.name); });
          }
        });
      }
      const tags = [
        g.title,
        g.budgetLabel     || '',
        g.metaDescription || '',
        g.intro           || '',
        ...sectionProductNames,
      ].filter(Boolean).join(' ').toLowerCase();
      entries.push({
        type:  'guide',
        icon:  g.emoji || '\uD83D\uDCCB',
        title: g.title,
        desc:  g.metaDescription || g.intro || '',
        price: g.budgetLabel || null,  // FIX: was g.budget (always undefined)
        url,
        tags,
      });
    });

    const js = [
      buildHeader('SP_SEARCH_INDEX', ['products.json', 'comparisons.json', 'guides.json']),
      '',
      JSON.stringify(entries, null, 2) + ';',
      '',
    ].join('\n');

    writeOutput(path.join(JS_DATA_DIR, 'search-index.js'), js);
    console.log(`  ✓ assets/js/data/search-index.js (${entries.length} entries: ${products.length} products, ${comparisons.length} comparisons, ${guides.length} guides)`);
    passed++;
  } catch (err) {
    console.error(`  ✗ Failed to export search-index.js: ${err.message}`);
    failed++;
  }

  console.log(`\n  Exported ${passed} file(s).${failed ? ` Failed: ${failed}.` : ''}`);

  // A partial export leaves stale/mismatched files — abort the build.
  if (failed > 0) {
    throw new Error(`export step: ${failed} export(s) failed — see errors above`);
  }
}());

// ===========================================================================
// STEP 8 — Stamp sw.js with build-time version
//
// BUG FIX: The previous regex tried to match `"sp-\d{14}"` or `__SP_VERSION__`,
// but sw.js used `var CACHE_NAME = 'sp-v2-shell-v1'` — neither pattern ever
// matched, so CACHE_NAME was NEVER updated between builds.
//
// FIX: sw.js now uses `'__SP_VERSION__'` as its CACHE_NAME placeholder.
// This step replaces `'__SP_VERSION__'` (with surrounding single quotes)
// with the double-quoted version string produced by JSON.stringify().
// Result: var CACHE_NAME = "sp-20260225143022";
// ===========================================================================
console.log('\nStep 8 — Stamping sw.js with build version...');
try {
  const swPath    = path.join(ROOT, 'sw.js');
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const version   = `sp-${timestamp}`;
  const swContent = fs.readFileSync(swPath, 'utf8');

  if (!swContent.includes("'__SP_VERSION__'")) {
    throw new Error(
      "sw.js is missing the '__SP_VERSION__' placeholder in CACHE_NAME.\n" +
      "Expected:  var CACHE_NAME = '__SP_VERSION__';\n" +
      "Restore the placeholder if it was accidentally replaced with a hardcoded value."
    );
  }

  fs.writeFileSync(
    swPath,
    swContent.replace(/'__SP_VERSION__'/g, JSON.stringify(version)),
    'utf8'
  );
  console.log(`   🔖 SW version stamped: ${version}`);
} catch (err) {
  console.error('Step 8 failed:', err.message);
  process.exit(1);
}

// ===========================================================================
// STEP 9 — Restore __CSP_NONCE__ placeholders in source files
//
// Generated HTML pages (written in steps 3–5) already have the real nonce
// baked in — that is correct and intentional.
// This step restores the placeholders only in the two SOURCE files so that
// git status stays clean and the next build always finds __CSP_NONCE__ to stamp.
// ===========================================================================
console.log('\nStep 9 — Restoring CSP nonce placeholders in source files...');
try {
  const escapedNonce = nonce.replace(/[+/=]/g, '\\$&');
  const nonceValueRe = new RegExp(escapedNonce, 'g');

  let h = fs.readFileSync(headersPath, 'utf8');
  fs.writeFileSync(headersPath, h.replace(nonceValueRe, '__CSP_NONCE__'), 'utf8');

  let p = fs.readFileSync(headPath, 'utf8');
  fs.writeFileSync(headPath, p.replace(nonceValueRe, '__CSP_NONCE__'), 'utf8');

  console.log('   ♻️  Placeholders restored');
} catch (err) {
  // Non-fatal — build output is still correct. Warn loudly so the developer
  // knows to manually restore the placeholder before committing.
  console.warn('\n⚠️  Step 9 warning: could not restore __CSP_NONCE__ placeholders.');
  console.warn('   Before committing, manually replace the nonce value in:');
  console.warn('     _headers           (nonce-<value> → nonce-__CSP_NONCE__)');
  console.warn('     _templates/_partials/head.html  (nonce="<value>" → nonce="__CSP_NONCE__")');
  console.warn('   Reason:', err.message);
}

// ===========================================================================
// DONE
// ===========================================================================
const elapsed = ((Date.now() - start) / 1000).toFixed(2);
console.log(`\n✅ Build complete in ${elapsed}s\n`);
