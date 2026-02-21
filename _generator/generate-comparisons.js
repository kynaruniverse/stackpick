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
// Build the intro HTML block (Quick Answer + Price Comparison)
// ---------------------------------------------------------------------------
function buildIntroHTML(comp) {
  const lines = comp.intro
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const paragraphs = lines.map(l => `          <p>${escapeHtml(l)}</p>`).join('\n');

  return `          <h2>Quick Answer</h2>\n${paragraphs}`;
}

// ---------------------------------------------------------------------------
// Build spec table rows HTML
// ---------------------------------------------------------------------------
function buildSpecTableHTML(specTable, comp) {
  return specTable.map(row => {
    const winA = row.winner === 'a';
    const winB = row.winner === 'b';
    const tdA  = winA
      ? `<td class="comparison-winner">${escapeHtml(row.a)}</td>`
      : `<td>${escapeHtml(row.a)}</td>`;
    const tdB  = winB
      ? `<td class="comparison-winner">${escapeHtml(row.b)}</td>`
      : `<td>${escapeHtml(row.b)}</td>`;
    return `                <tr>\n                  <td>${escapeHtml(row.label)}</td>\n                  ${tdA}\n                  ${tdB}\n                </tr>`;
  }).join('\n');
}

// ---------------------------------------------------------------------------
// Build sections HTML (h3 + paragraphs)
// ---------------------------------------------------------------------------
function buildSectionsHTML(sections) {
  return sections.map(section => {
    const heading = `          <h3>${escapeHtml(section.heading)}</h3>`;
    const paras = section.body
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => `          <p>${escapeHtml(l)}</p>`)
      .join('\n');
    return `${heading}\n${paras}`;
  }).join('\n\n');
}

// ---------------------------------------------------------------------------
// Build verdict HTML (split on double newlines → separate <p> tags)
// ---------------------------------------------------------------------------
function buildVerdictHTML(verdict) {
  return verdict
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `            <p>${escapeHtml(l)}</p>`)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Build the two buy cards HTML
// ---------------------------------------------------------------------------
function buildBuyCardsHTML(comp) {
  function card(product) {
    const badgeStyle = product.badgeColor
      ? ` style="background:${escapeHtml(product.badgeColor)};"`
      : '';
    return `            <div class="product-card">
              <div class="product-content">
                <span class="product-badge"${badgeStyle}>${escapeHtml(product.badge)}</span>
                <h3 class="product-title">${escapeHtml(product.name)}</h3>
                <div class="product-price-block">
                  <span class="price-current-label">Amazon price</span>
                  <span class="price-current">${escapeHtml(product.price)}</span>
                </div>
                <p class="product-desc">${escapeHtml(product.desc)}</p>
                <a href="${escapeHtml(product.affiliate)}" target="_blank" rel="noopener sponsored" class="product-btn">View on Amazon →</a>
              </div>
            </div>`;
  }
  return `${card(comp.productA)}\n${card(comp.productB)}`;
}

// ---------------------------------------------------------------------------
// Build related links HTML
// ---------------------------------------------------------------------------
function buildRelatedLinksHTML(relatedLinks) {
  if (!relatedLinks || relatedLinks.length === 0) return '';
  const links = relatedLinks
    .map(l => `          <a href="${escapeHtml(l.href)}" class="category-card" style="text-decoration:none;">
            <div class="category-icon">⚖️</div>
            <h3>${escapeHtml(l.label)}</h3>
          </a>`)
    .join('\n');
  return `\n          <h2>Explore More</h2>\n          <div class="category-grid" style="margin-top:1rem;">\n${links}\n          </div>`;
}

// ---------------------------------------------------------------------------
// Build schema.org JSON-LD for a comparison
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

  return `  <script type="application/ld+json">\n  ${JSON.stringify(article)}\n  </script>\n` +
         `  <script type="application/ld+json">\n  ${JSON.stringify(breadcrumb)}\n  </script>`;
}

// ---------------------------------------------------------------------------
// Generate one comparison page
// ---------------------------------------------------------------------------
function generateComparison(comp) {
  const introHTML        = buildIntroHTML(comp);
  const specTableHTML    = buildSpecTableHTML(comp.specTable, comp);
  const sectionsHTML     = buildSectionsHTML(comp.sections);
  const verdictHTML      = buildVerdictHTML(comp.verdict);
  const buyCardsHTML     = buildBuyCardsHTML(comp);
  const relatedLinksHTML = buildRelatedLinksHTML(comp.relatedLinks);
  const schemaJSON       = buildSchemaJSON(comp);

  const data = {
    // head.html placeholders
    pageTitle:       comp.metaTitle,
    metaDescription: comp.metaDescription,
    ogType:          'article',
    ogTitle:         comp.ogTitle || comp.metaTitle,
    ogDescription:   comp.ogDescription || comp.metaDescription,
    canonical:       comp.canonical,
    emoji:           comp.emoji || '⚖️',
    schemaJSON,
    // header/sidebar active page
    activePage:      'comparisons',
    // comparison.html placeholders
    heroTitle:       comp.heroTitle || comp.title,
    heroSubtitle:    comp.heroSubtitle || '',
    breadcrumbLabel: comp.breadcrumbLabel || comp.title,
    productAName:    comp.productA.name,
    productBName:    comp.productB.name,
    // rendered HTML blobs (raw — already safe HTML)
    introHTML,
    specTableHTML,
    sectionsHTML,
    verdictHTML,
    buyCardsHTML,
    relatedLinksHTML,
  };

  return renderPage({ partialsDir: PARTIALS_DIR, template: TEMPLATE, data });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function run() {
  const comparisons = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  let count = 0;
  for (const comp of comparisons) {
    const html       = generateComparison(comp);
    const outputPath = path.join(ROOT, 'comparisons', comp.slug, 'index.html');
    writeFile(outputPath, html);
    console.log(`  ✓ comparisons/${comp.slug}/index.html`);
    count++;
  }

  console.log(`\n  Generated ${count} comparison pages.`);
}

run();
