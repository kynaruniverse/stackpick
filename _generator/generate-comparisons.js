'use strict';

/**
 * StackPick generate-comparisons.js
 *
 * Reads:  _data/comparisons.json
 * Writes: comparisons/[slug]/index.html  (one per comparison)
 *
 * Run standalone: node _generator/generate-comparisons.js
 * Called by:      _generator/build.js
 */

const fs   = require('fs');
const path = require('path');

const { renderPage, writeFile, escapeHtml } = require('./lib/render.js');

const ROOT         = path.join(__dirname, '..');
const DATA_FILE    = path.join(ROOT, '_data', 'comparisons.json');
const TEMPLATE_DIR = path.join(ROOT, '_templates');
const PARTIALS_DIR = path.join(TEMPLATE_DIR, '_partials');
const TEMPLATE     = fs.readFileSync(path.join(TEMPLATE_DIR, 'comparison.html'), 'utf8');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Splits a multi-line string into escaped <p> tags at a given indent. */
function paragraphs(text, indent = '') {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `${indent}<p>${escapeHtml(l)}</p>`)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Block builders
// ---------------------------------------------------------------------------

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
  const heading = buySection?.heading
    ? `<h2>${escapeHtml(buySection.heading)}</h2>`
    : '<h2>Which should you buy?</h2>';

  function card(product, buy) {
    const badgeStyle = product.badgeColor
      ? ` style="background:${escapeHtml(product.badgeColor)};"`
      : '';
    const points = (buy?.points ?? [])
      .map(pt => `<li>${escapeHtml(pt)}</li>`)
      .join('');
    const buyHeading = buy?.heading
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
    <a href="${escapeHtml(product.affiliate)}" target="_blank" rel="noopener sponsored" class="product-btn">${escapeHtml(product.linkLabel || 'View on Amazon →')}</a>
    ${product.linkHref ? `<a href="${escapeHtml(product.linkHref)}" class="product-link">${escapeHtml(product.linkLabel || 'See full specs →')}</a>` : ''}
  </div>
</div>`;
  }

  return `${heading}\n<div class="buy-cards">\n${card(productA, buySection?.buyA)}\n${card(productB, buySection?.buyB)}\n</div>`;
}

function buildVerdictHTML(verdict) {
  return paragraphs(verdict);
}

function buildRelatedLinksHTML(relatedLinks) {
  if (!relatedLinks?.length) return '';
  const links = relatedLinks
    .map(({ href, label }) =>
      `<a href="${escapeHtml(href)}" class="category-card" style="text-decoration:none;">
  <div class="category-icon">⚖️</div>
  <h3>${escapeHtml(label)}</h3>
</a>`
    )
    .join('\n');
  return `<h2>Explore More</h2>\n<div class="category-grid" style="margin-top:1rem;">\n${links}\n</div>`;
}

// ---------------------------------------------------------------------------
// Schema.org JSON-LD
// ---------------------------------------------------------------------------

function buildSchemaJSON(comp) {
  const article = {
    '@context':    'https://schema.org',
    '@type':       'Article',
    headline:      comp.title,
    description:   comp.metaDescription,
    url:           comp.canonical,
    author:        { '@type': 'Organization', name: 'Stack Pick', url: 'https://stackpick.co.uk' },
    publisher:     { '@type': 'Organization', name: 'Stack Pick', url: 'https://stackpick.co.uk' },
    datePublished: comp.datePublished,
    dateModified:  comp.dateModified || comp.datePublished,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://stackpick.co.uk/' },
      { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://stackpick.co.uk/comparisons/' },
      { '@type': 'ListItem', position: 3, name: comp.breadcrumbLabel || comp.title, item: comp.canonical },
    ],
  };

  // ItemList schema exposes both products to search engines as structured data
  const itemList = {
    '@context': 'https://schema.org',
    '@type':    'ItemList',
    name:       comp.title,
    url:        comp.canonical,
    itemListElement: [
      {
        '@type':    'ListItem',
        position:   1,
        name:       comp.productA.name,
        url:        comp.productA.affiliate,
      },
      {
        '@type':    'ListItem',
        position:   2,
        name:       comp.productB.name,
        url:        comp.productB.affiliate,
      },
    ],
  };

  const toTag = obj =>
    `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;

  return [article, breadcrumb, itemList].map(toTag).join('\n');
}

// ---------------------------------------------------------------------------
// Validate a comparison entry and warn loudly on missing required fields
// ---------------------------------------------------------------------------
const REQUIRED_FIELDS = [
  'slug', 'title', 'metaTitle', 'metaDescription', 'canonical',
  'datePublished', 'intro', 'specTable', 'sections', 'verdict',
  'productA', 'productB', 'relatedLinks',
];
const REQUIRED_PRODUCT_FIELDS = ['name', 'badge', 'price', 'affiliate', 'desc'];

function validate(comp) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (comp[field] == null) errors.push(`Missing required field: "${field}"`);
  }
  for (const [key, product] of [['productA', comp.productA], ['productB', comp.productB]]) {
    if (!product) continue;
    for (const field of REQUIRED_PRODUCT_FIELDS) {
      if (product[field] == null) errors.push(`Missing ${key}.${field}`);
    }
  }
  if (errors.length) {
    console.warn(`\n  ⚠️  Validation errors in "${comp.slug}":`);
    errors.forEach(e => console.warn(`     - ${e}`));
  }
  return errors.length === 0;
}

// ---------------------------------------------------------------------------
// Generate one comparison page
// ---------------------------------------------------------------------------

function generateComparison(comp) {
  const data = {
    // <head> placeholders
    pageTitle:       comp.metaTitle,
    metaDescription: comp.metaDescription,
    ogType:          'article',
    ogTitle:         comp.ogTitle        || comp.metaTitle,
    ogDescription:   comp.ogDescription  || comp.metaDescription,
    canonical:       comp.canonical,
    emoji:           comp.emoji          || '⚖️',
    datePublished:   comp.datePublished,
    dateModified:    comp.dateModified   || comp.datePublished,
    schemaJSON:      buildSchemaJSON(comp),
    // Navigation
    activePage:      'comparisons',
    // Page content
    heroTitle:       comp.heroTitle      || comp.title,
    heroSubtitle:    comp.heroSubtitle   || '',
    breadcrumbLabel: comp.breadcrumbLabel || comp.title,
    productAName:    comp.productA.name,
    productBName:    comp.productB.name,
    // Rendered HTML blocks (already escaped — insert as raw HTML)
    introHTML:       buildIntroHTML(comp),
    specTableHTML:   buildSpecTableHTML(comp.specTable),
    sectionsHTML:    buildSectionsHTML(comp.sections),
    buyCardsHTML:    buildBuyCardsHTML(comp),
    verdictHTML:     buildVerdictHTML(comp.verdict),
    relatedLinksHTML: buildRelatedLinksHTML(comp.relatedLinks),
  };

  return renderPage({ partialsDir: PARTIALS_DIR, template: TEMPLATE, data });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function run() {
  const comparisons = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  let passed = 0;
  let failed = 0;

  for (const comp of comparisons) {
    const valid = validate(comp);
    if (!valid) { failed++; continue; }

    const html       = generateComparison(comp);
    const outputPath = path.join(ROOT, 'comparisons', comp.slug, 'index.html');
    writeFile(outputPath, html);
    console.log(`  ✓ comparisons/${comp.slug}/index.html`);
    passed++;
  }

  console.log(`\n  Generated ${passed} comparison page(s).${failed ? ` Skipped ${failed} with errors.` : ''}`);
}

// FIX: guard with require.main to prevent auto-execution when imported by build.js
if (require.main === module) {
  run();
}

module.exports = { run };
