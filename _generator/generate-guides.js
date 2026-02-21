'use strict';

/**
 * StackPick generate-guides.js
 *
 * Reads:  _data/guides.json
 *         _data/products.json  (not used directly — guide products are self-contained in JSON)
 * Writes: guides/[slug]/index.html  (one per guide)
 *
 * Run standalone: node _generator/generate-guides.js
 * Called by:      _generator/build.js
 */

const fs   = require('fs');
const path = require('path');

const { renderPage, writeFile, escapeHtml } = require('./lib/render.js');

const ROOT         = path.join(__dirname, '..');
const DATA_FILE    = path.join(ROOT, '_data', 'guides.json');
const TEMPLATE_DIR = path.join(ROOT, '_templates');
const PARTIALS_DIR = path.join(TEMPLATE_DIR, '_partials');
const TEMPLATE     = fs.readFileSync(path.join(TEMPLATE_DIR, 'guide.html'), 'utf8');

// ---------------------------------------------------------------------------
// Build summary table rows HTML
// ---------------------------------------------------------------------------
function buildSummaryTableHTML(summaryTable) {
  return summaryTable.map(row => {
    return `              <tr>
                <td>${escapeHtml(row.emoji || '')} ${escapeHtml(row.category)}</td>
                <td>${escapeHtml(row.pick)}</td>
                <td><strong>${escapeHtml(row.price)}</strong></td>
              </tr>`;
  }).join('\n');
}

// ---------------------------------------------------------------------------
// Build summary totals HTML (total row beneath table)
// ---------------------------------------------------------------------------
function buildSummaryTotalsHTML(summaryTotals) {
  if (!summaryTotals || summaryTotals.length === 0) return '';
  const rows = summaryTotals.map(t =>
    `        <p style="text-align:right;font-size:0.9rem;margin-top:0.5rem;font-weight:600;">${escapeHtml(t.label)}: ${escapeHtml(t.value)}</p>`
  ).join('\n');
  return rows;
}

// ---------------------------------------------------------------------------
// Build a single product card for a guide section
// ---------------------------------------------------------------------------
function buildGuideProductCard(product) {
  const badgeStyle = product.badgeColor
    ? ` style="background:${escapeHtml(product.badgeColor)};"`
    : '';

  let prosHTML = '';
  if (Array.isArray(product.pros)) {
    prosHTML = product.pros.map(p =>
      `              <li class="pro"><span class="pro-icon">✓</span> ${escapeHtml(p)}</li>`
    ).join('\n');
  }

  let consHTML = '';
  if (Array.isArray(product.cons)) {
    consHTML = product.cons.map(c =>
      `              <li class="con"><span class="con-icon">✕</span> ${escapeHtml(c)}</li>`
    ).join('\n');
  }

  let rrpBlock = '';
  if (product.priceRrp) {
    rrpBlock = `
                  <span class="price-rrp-wrap">
                    <span class="price-rrp-label">RRP</span>
                    <span class="price-rrp">${escapeHtml(product.priceRrp)}</span>
                  </span>
                  <span class="price-saving">${escapeHtml(product.priceSaving || '')}</span>`;
  }

  return `          <div class="product-card">
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
// Build all guide sections HTML
// ---------------------------------------------------------------------------
function buildSectionsHTML(sections) {
  return sections.map(section => {
    const introP = section.intro
      ? `        <p>${escapeHtml(section.intro)}</p>`
      : '';

    const cardsHTML = Array.isArray(section.products)
      ? section.products.map(buildGuideProductCard).join('\n\n')
      : '';

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

// ---------------------------------------------------------------------------
// Build buying guide HTML
// ---------------------------------------------------------------------------
function buildBuyingGuideHTML(buyingGuide) {
  if (!buyingGuide) return '';

  const heading = buyingGuide.heading
    ? `          <h2>${escapeHtml(buyingGuide.heading)}</h2>\n`
    : '';

  const paras = (buyingGuide.body || '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `          <p>${escapeHtml(l)}</p>`)
    .join('\n');

  return `${heading}${paras}`;
}

// ---------------------------------------------------------------------------
// Build related guides HTML
// ---------------------------------------------------------------------------
function buildRelatedGuidesHTML(relatedGuides) {
  if (!relatedGuides || relatedGuides.length === 0) return '';
  return relatedGuides.map(g => `          <a href="${escapeHtml(g.href)}" class="category-card">
            <div class="category-icon">${escapeHtml(g.emoji || '📋')}</div>
            <h3>${escapeHtml(g.title)}</h3>
            <p>${escapeHtml(g.desc)}</p>
          </a>`).join('\n');
}

// ---------------------------------------------------------------------------
// Build schema.org JSON-LD for a guide
// ---------------------------------------------------------------------------
function buildSchemaJSON(guide) {
  const article = {
    '@context':    'https://schema.org',
    '@type':       'Article',
    headline:      guide.title,
    description:   guide.metaDescription,
    url:           guide.canonical,
    author:        { '@type': 'Organization', name: 'Stack Pick', url: 'https://stackpick.co.uk' },
    publisher:     { '@type': 'Organization', name: 'Stack Pick', url: 'https://stackpick.co.uk' },
    datePublished: guide.datePublished,
    dateModified:  guide.dateModified || guide.datePublished,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',   item: 'https://stackpick.co.uk/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://stackpick.co.uk/guides/' },
      { '@type': 'ListItem', position: 3, name: guide.breadcrumbLabel || guide.title, item: guide.canonical },
    ],
  };

  return `  <script type="application/ld+json">\n  ${JSON.stringify(article)}\n  </script>\n` +
         `  <script type="application/ld+json">\n  ${JSON.stringify(breadcrumb)}\n  </script>`;
}

// ---------------------------------------------------------------------------
// Generate one guide page
// ---------------------------------------------------------------------------
function generateGuide(guide) {
  const summaryTableHTML  = buildSummaryTableHTML(guide.summaryTable);
  const summaryTotalsHTML = buildSummaryTotalsHTML(guide.summaryTotals);
  const sectionsHTML      = buildSectionsHTML(guide.sections);
  const buyingGuideHTML   = buildBuyingGuideHTML(guide.buyingGuide);
  const relatedGuidesHTML = buildRelatedGuidesHTML(guide.relatedGuides);
  const schemaJSON        = buildSchemaJSON(guide);

  const data = {
    // head.html placeholders
    pageTitle:       guide.metaTitle,
    metaDescription: guide.metaDescription,
    ogType:          'article',
    ogTitle:         guide.ogTitle || guide.metaTitle,
    ogDescription:   guide.ogDescription || guide.metaDescription,
    canonical:       guide.canonical,
    emoji:           guide.emoji || '📋',
    schemaJSON,
    // header/sidebar active page
    activePage:      'guides',
    // guide.html placeholders
    heroTitle:       guide.heroTitle,
    heroSubtitle:    guide.heroSubtitle,
    breadcrumbLabel: guide.breadcrumbLabel || guide.title,
    intro:           guide.intro || '',
    // rendered HTML blobs (raw — already safe HTML)
    summaryTableHTML,
    summaryTotalsHTML,
    sectionsHTML,
    buyingGuideHTML,
    relatedGuidesHTML,
  };

  return renderPage({ partialsDir: PARTIALS_DIR, template: TEMPLATE, data });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function run() {
  const guides = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  let count = 0;
  for (const guide of guides) {
    const html       = generateGuide(guide);
    const outputPath = path.join(ROOT, 'guides', guide.slug, 'index.html');
    writeFile(outputPath, html);
    console.log(`  ✓ guides/${guide.slug}/index.html`);
    count++;
  }

  console.log(`\n  Generated ${count} guide pages.`);
}

run();
