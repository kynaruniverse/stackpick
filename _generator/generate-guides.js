'use strict';

/**
 * StackPick generate-guides.js
 *
 * Reads:  _data/guides.json
 * Writes: guides/[slug]/index.html  (one per guide)
 *
 * Run standalone: node _generator/generate-guides.js
 * Called by:      _generator/build.js
 *
 * Data contract (guides.json) — each guide must contain:
 *   slug, title, metaTitle, metaDescription, canonical, datePublished,
 *   heroTitle, heroSubtitle, breadcrumbLabel, intro, summaryTable,
 *   summaryTotals, sections, buyingGuide, relatedGuides
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
// Validation
// ---------------------------------------------------------------------------
const REQUIRED_GUIDE_FIELDS = [
  'slug', 'title', 'metaTitle', 'metaDescription', 'canonical',
  'datePublished', 'heroTitle', 'heroSubtitle', 'breadcrumbLabel',
  'intro', 'summaryTable', 'summaryTotals', 'sections',
];

const REQUIRED_PRODUCT_FIELDS = ['name', 'badge', 'price', 'affiliate', 'desc', 'pros', 'cons'];

function validateGuide(guide) {
  const errors = [];
  for (const f of REQUIRED_GUIDE_FIELDS) {
    if (guide[f] == null) errors.push(`missing field "${f}"`);
  }
  if (!Array.isArray(guide.summaryTable)) errors.push('"summaryTable" must be an array');
  if (!Array.isArray(guide.summaryTotals)) errors.push('"summaryTotals" must be an array');
  if (!Array.isArray(guide.sections))     errors.push('"sections" must be an array');

  (guide.sections || []).forEach((sec, si) => {
    if (!sec.heading) errors.push(`sections[${si}] missing heading`);
    if (!Array.isArray(sec.products) || sec.products.length === 0) {
      errors.push(`sections[${si}] has no products`);
    }
    (sec.products || []).forEach((p, pi) => {
      for (const f of REQUIRED_PRODUCT_FIELDS) {
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

// ---------------------------------------------------------------------------
// Build summary table rows HTML
// ---------------------------------------------------------------------------
function buildSummaryTableHTML(summaryTable) {
  return summaryTable.map(row =>
    `              <tr>
                <td>${escapeHtml(row.emoji || '')} ${escapeHtml(row.category)}</td>
                <td>${escapeHtml(row.pick)}</td>
                <td><strong>${escapeHtml(row.price)}</strong></td>
              </tr>`
  ).join('\n');
}

// ---------------------------------------------------------------------------
// Build summary totals HTML
// ---------------------------------------------------------------------------
function buildSummaryTotalsHTML(summaryTotals) {
  if (!summaryTotals || summaryTotals.length === 0) return '';
  return summaryTotals.map(t =>
    `        <p style="text-align:right;font-size:0.9rem;margin-top:0.5rem;font-weight:600;">${escapeHtml(t.label)}: ${escapeHtml(t.value)}</p>`
  ).join('\n');
}

// ---------------------------------------------------------------------------
// Build a single product card
// ---------------------------------------------------------------------------
function buildGuideProductCard(product) {
  const badgeStyle = product.badgeColor
    ? ` style="background:${escapeHtml(product.badgeColor)};"`
    : '';

  const prosHTML = Array.isArray(product.pros)
    ? product.pros.map(p =>
        `              <li class="pro"><span class="pro-icon">✓</span> ${escapeHtml(p)}</li>`
      ).join('\n')
    : '';

  const consHTML = Array.isArray(product.cons)
    ? product.cons.map(c =>
        `              <li class="con"><span class="con-icon">✕</span> ${escapeHtml(c)}</li>`
      ).join('\n')
    : '';

  const rrpBlock = product.priceRrp
    ? `\n                  <span class="price-rrp-wrap">` +
      `<span class="price-rrp-label">RRP</span>` +
      `<span class="price-rrp">${escapeHtml(product.priceRrp)}</span></span>` +
      `<span class="price-saving">${escapeHtml(product.priceSaving || '')}</span>`
    : '';

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
    const cardsHTML = section.products.map(buildGuideProductCard).join('\n\n');
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
  return relatedGuides.map(g =>
    `          <a href="${escapeHtml(g.href)}" class="category-card">
            <div class="category-icon">${escapeHtml(g.emoji || '📋')}</div>
            <h3>${escapeHtml(g.title)}</h3>
            <p>${escapeHtml(g.desc)}</p>
          </a>`
  ).join('\n');
}

// ---------------------------------------------------------------------------
// Build schema.org JSON-LD
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
      { '@type': 'ListItem', position: 3, name: guide.breadcrumbLabel, item: guide.canonical },
    ],
  };

  const toTag = obj =>
    `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;

  return [article, breadcrumb].map(toTag).join('\n');
}

// ---------------------------------------------------------------------------
// Generate one guide page
// ---------------------------------------------------------------------------
function generateGuide(guide) {
  const data = {
    // <head> placeholders
    pageTitle:        guide.metaTitle,
    metaDescription:  guide.metaDescription,
    ogType:           'article',
    ogTitle:          guide.ogTitle       || guide.metaTitle,
    ogDescription:    guide.ogDescription || guide.metaDescription,
    canonical:        guide.canonical,
    emoji:            guide.emoji         || '📋',
    datePublished:    guide.datePublished,
    dateModified:     guide.dateModified  || guide.datePublished,
    schemaJSON:       buildSchemaJSON(guide),
    // navigation
    activePage:       'guides',
    // page content
    heroTitle:        guide.heroTitle,
    heroSubtitle:     guide.heroSubtitle,
    breadcrumbLabel:  guide.breadcrumbLabel,
    budgetLabel:      guide.budgetLabel   || '',
    intro:            escapeHtml(guide.intro || ''),
    // rendered HTML blobs — already escaped, insert raw
    summaryTableHTML:  buildSummaryTableHTML(guide.summaryTable),
    summaryTotalsHTML: buildSummaryTotalsHTML(guide.summaryTotals),
    sectionsHTML:      buildSectionsHTML(guide.sections),
    buyingGuideHTML:   buildBuyingGuideHTML(guide.buyingGuide),
    relatedGuidesHTML: buildRelatedGuidesHTML(guide.relatedGuides),
  };

  return renderPage({ partialsDir: PARTIALS_DIR, template: TEMPLATE, data });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function run() {
  const guides = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  let passed = 0;
  let failed = 0;

  for (const guide of guides) {
    if (!validateGuide(guide)) { failed++; continue; }
    try {
      const html       = generateGuide(guide);
      const outputPath = path.join(ROOT, 'guides', guide.slug, 'index.html');
      writeFile(outputPath, html);
      console.log(`  ✓ guides/${guide.slug}/index.html`);
      passed++;
    } catch (err) {
      console.error(`  ✗ Failed to generate "${guide.slug}": ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  Generated ${passed} guide page(s).${failed ? ` Failed: ${failed}.` : ''}`);
}

// FIX: guard with require.main to prevent auto-execution when imported by build.js
if (require.main === module) {
  run();
}

module.exports = { run };
