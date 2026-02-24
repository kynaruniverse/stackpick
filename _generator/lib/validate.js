'use strict';

/**
 * StackPick validate.js
 *
 * Validates all _data/*.json files before the build runs.
 * Called by: _generator/build.js (Step 1)
 * Run standalone: node _generator/lib/validate.js
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../_data');

let errorCount = 0;
function error(msg) {
  console.error(`  ✗ ${msg}`);
  errorCount++;
}

function warn(msg) {
  console.warn(`  ⚠ ${msg}`);
}

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    error(`Missing file: _data/${filename}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    error(`Invalid JSON in _data/${filename}: ${e.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const REQUIRED_PRODUCT_FIELDS = [
  'id', 'category', 'brand', 'badge', 'name', 'shortName',
  'specs', 'desc', 'pros', 'cons',
  'price', 'priceRaw', 'affiliate',
  'url', 'emoji', 'inStock',
];

const EXTRA_FIELDS = ['seam', 'loadoutCount', 'tags', 'nextDay'];

const REQUIRED_COMPARISON_FIELDS = [
  'slug', 'title', 'metaTitle', 'metaDescription',
  'canonical', 'datePublished', 'emoji',
  'intro', 'productA', 'productB', 'specTable',
  'sections', 'verdict',
];

// FIX: was ['slug','title','budget',...] — guides.json uses 'budgetLabel', not 'budget'.
// Checking for 'budget' caused 1 false error per guide (5 total) on every build.
//
// Also added fields that generate-guides.js requires with no fallback and will throw
// on if absent: 'heroTitle', 'heroSubtitle', 'breadcrumbLabel', 'summaryTotals'.
// These were previously unvalidated despite being consumed as required by the generator.
const REQUIRED_GUIDE_FIELDS = [
  'slug', 'title', 'metaTitle', 'metaDescription',
  'canonical', 'datePublished', 'emoji',
  'heroTitle', 'heroSubtitle', 'breadcrumbLabel',
  'intro', 'summaryTable', 'summaryTotals', 'sections',
];

const VALID_CATEGORIES = ['mice', 'keyboards', 'headsets', 'monitors', 'chairs', 'desks', 'speakers', 'pcs', 'extras'];
const VALID_SEAMS      = ['crimson', 'cobalt', 'slate', 'amber', 'jade', 'purple'];
const DATE_RE          = /^\d{4}-\d{2}-\d{2}$/;
const SPECS_LENGTH     = 3;

// Placeholder value written into guides.json stub affiliate URLs that have not
// yet been replaced with real Amazon shortlinks.
const TODO_AFFILIATE = 'TODO:REPLACE_WITH_REAL_AFFILIATE_URL';


// ---------------------------------------------------------------------------
// Product validation
// ---------------------------------------------------------------------------
function validateProducts(products) {
  if (!Array.isArray(products)) { error('products.json must be an array'); return new Set(); }

  const ids = new Set();

  products.forEach((p, i) => {
    const prefix = `products[${i}] (${p.id || 'unknown'})`;

    // Required core fields
    REQUIRED_PRODUCT_FIELDS.forEach(field => {
      if (p[field] === undefined || p[field] === null || p[field] === '') {
        error(`${prefix}: missing required field "${field}"`);
      }
    });

    // Extra fields
    EXTRA_FIELDS.forEach(field => {
      if (p[field] === undefined) error(`${prefix}: missing extra field "${field}"`);
    });

    // Unique IDs
    if (p.id && ids.has(p.id)) error(`${prefix}: duplicate id "${p.id}"`);
    if (p.id) ids.add(p.id);

    // Valid category
    if (p.category && !VALID_CATEGORIES.includes(p.category)) {
      error(`${prefix}: invalid category "${p.category}"`);
    }

    // Valid seam
    if (p.seam && !VALID_SEAMS.includes(p.seam)) {
      error(`${prefix}: invalid seam "${p.seam}" — must be one of: ${VALID_SEAMS.join(', ')}`);
    }

    // Affiliate URL must be https
    if (p.affiliate && !p.affiliate.startsWith('https://')) {
      error(`${prefix}: affiliate link must be secure (https)`);
    }

    // priceRaw must be a positive number
    if (typeof p.priceRaw !== 'number') {
      error(`${prefix}: priceRaw must be a number`);
    } else if (p.priceRaw <= 0) {
      error(`${prefix}: priceRaw must be a positive number (got ${p.priceRaw})`);
    }

    // specs must be exactly SPECS_LENGTH items
    if (Array.isArray(p.specs)) {
      if (p.specs.length !== SPECS_LENGTH) {
        error(`${prefix}: specs must have exactly ${SPECS_LENGTH} items (got ${p.specs.length})`);
      }
    }

    // pros/cons must be arrays with at least one item
    if (Array.isArray(p.pros) && p.pros.length === 0) {
      error(`${prefix}: pros array is empty`);
    }
    if (Array.isArray(p.cons) && p.cons.length === 0) {
      error(`${prefix}: cons array is empty`);
    }

    // tags must be a non-empty array
    if (p.tags !== undefined) {
      if (!Array.isArray(p.tags) || p.tags.length === 0) {
        error(`${prefix}: tags must be a non-empty array`);
      }
    }

    // inStock must be a boolean
    if (p.inStock !== undefined && typeof p.inStock !== 'boolean') {
      error(`${prefix}: inStock must be true or false`);
    }

    // nextDay must be a boolean
    if (p.nextDay !== undefined && typeof p.nextDay !== 'boolean') {
      error(`${prefix}: nextDay must be true or false`);
    }

    // loadoutCount must be a non-negative integer
    if (p.loadoutCount !== undefined) {
      if (typeof p.loadoutCount !== 'number' || !Number.isInteger(p.loadoutCount) || p.loadoutCount < 0) {
        error(`${prefix}: loadoutCount must be a non-negative integer`);
      }
    }
  });

  return ids;
}


// ---------------------------------------------------------------------------
// Collections validation
// ---------------------------------------------------------------------------
function validateCollections(collections, productIds) {
  if (!Array.isArray(collections)) { error('collections.json must be an array'); return; }

  const collectionIds = new Set();

  collections.forEach((c, i) => {
    const prefix = `collections[${i}] (${c.id || 'unknown'})`;

    if (!c.id)    error(`${prefix}: missing required field "id"`);
    if (!c.label) error(`${prefix}: missing required field "label"`);

    // Unique collection IDs
    if (c.id && collectionIds.has(c.id)) error(`${prefix}: duplicate collection id "${c.id}"`);
    if (c.id) collectionIds.add(c.id);

    // Cross-reference baseProducts against known product IDs
    if (c.baseProducts) {
      if (!Array.isArray(c.baseProducts) || c.baseProducts.length === 0) {
        error(`${prefix}: baseProducts must be a non-empty array`);
      } else {
        c.baseProducts.forEach(id => {
          if (!productIds.has(id)) {
            error(`${prefix}: baseProducts references unknown product id "${id}"`);
          }
        });
      }
    }

    // Cross-reference shuffleVariants if present.
    // shuffleVariants[].products is an array of product ID strings (not full objects).
    if (c.shuffleVariants) {
      if (!Array.isArray(c.shuffleVariants)) {
        error(`${prefix}: shuffleVariants must be an array`);
      } else {
        c.shuffleVariants.forEach((v, vi) => {
          if (v.products) {
            v.products.forEach(id => {
              if (!productIds.has(id)) {
                error(`${prefix} shuffleVariants[${vi}]: references unknown product id "${id}"`);
              }
            });
          }
        });
      }
    }
  });
}


// ---------------------------------------------------------------------------
// Comparisons validation
// ---------------------------------------------------------------------------
function validateComparisons(comparisons) {
  if (!Array.isArray(comparisons)) { error('comparisons.json must be an array'); return; }

  const slugs = new Set();

  comparisons.forEach((c, i) => {
    const prefix = `comparisons[${i}] (${c.slug || 'unknown'})`;

    // Required fields
    REQUIRED_COMPARISON_FIELDS.forEach(field => {
      if (c[field] === undefined || c[field] === null || c[field] === '') {
        error(`${prefix}: missing required field "${field}"`);
      }
    });

    // Unique slugs
    if (c.slug && slugs.has(c.slug)) error(`${prefix}: duplicate slug "${c.slug}"`);
    if (c.slug) slugs.add(c.slug);

    // Date format
    if (c.datePublished && !DATE_RE.test(c.datePublished)) {
      error(`${prefix}: datePublished must be YYYY-MM-DD format (got "${c.datePublished}")`);
    }
    if (c.dateModified && !DATE_RE.test(c.dateModified)) {
      error(`${prefix}: dateModified must be YYYY-MM-DD format (got "${c.dateModified}")`);
    }

    // Canonical must be https
    if (c.canonical && !c.canonical.startsWith('https://')) {
      error(`${prefix}: canonical must be https`);
    }

    // productA and productB must have affiliate links
    ['productA', 'productB'].forEach(side => {
      if (c[side]) {
        if (!c[side].name)      error(`${prefix}: ${side} missing "name"`);
        if (!c[side].affiliate) error(`${prefix}: ${side} missing "affiliate"`);
        if (c[side].affiliate && !c[side].affiliate.startsWith('https://')) {
          error(`${prefix}: ${side}.affiliate must be https`);
        }
      }
    });

    // specTable must be a non-empty array
    if (Array.isArray(c.specTable) && c.specTable.length === 0) {
      error(`${prefix}: specTable is empty`);
    }

    // sections must be a non-empty array
    if (Array.isArray(c.sections) && c.sections.length === 0) {
      warn(`${prefix}: sections array is empty — comparison will have no body content`);
    }
  });
}


// ---------------------------------------------------------------------------
// Guides validation
// ---------------------------------------------------------------------------
function validateGuides(guides) {
  if (!Array.isArray(guides)) { error('guides.json must be an array'); return; }

  const slugs = new Set();

  guides.forEach((g, i) => {
    const prefix = `guides[${i}] (${g.slug || 'unknown'})`;

    // Required fields (FIX: list updated — see REQUIRED_GUIDE_FIELDS comment above)
    REQUIRED_GUIDE_FIELDS.forEach(field => {
      if (g[field] === undefined || g[field] === null || g[field] === '') {
        error(`${prefix}: missing required field "${field}"`);
      }
    });

    // FIX: 'budgetLabel' is optional (generate-guides.js uses || '' fallback) but
    // warn if absent so the omission is visible in build output.
    if (g.budgetLabel === undefined || g.budgetLabel === null || g.budgetLabel === '') {
      warn(`${prefix}: missing optional field "budgetLabel" — guide price will be blank in search index`);
    }

    // Unique slugs
    if (g.slug && slugs.has(g.slug)) error(`${prefix}: duplicate slug "${g.slug}"`);
    if (g.slug) slugs.add(g.slug);

    // Date format
    if (g.datePublished && !DATE_RE.test(g.datePublished)) {
      error(`${prefix}: datePublished must be YYYY-MM-DD format (got "${g.datePublished}")`);
    }
    if (g.dateModified && !DATE_RE.test(g.dateModified)) {
      error(`${prefix}: dateModified must be YYYY-MM-DD format (got "${g.dateModified}")`);
    }

    // Canonical must be https
    if (g.canonical && !g.canonical.startsWith('https://')) {
      error(`${prefix}: canonical must be https`);
    }

    // summaryTable must be a non-empty array
    if (Array.isArray(g.summaryTable) && g.summaryTable.length === 0) {
      error(`${prefix}: summaryTable is empty`);
    }

    // summaryTotals must be an array (can be empty — some guides have no totals row)
    if (g.summaryTotals !== undefined && !Array.isArray(g.summaryTotals)) {
      error(`${prefix}: summaryTotals must be an array`);
    }

    // sections must be a non-empty array with valid products
    if (Array.isArray(g.sections)) {
      if (g.sections.length === 0) {
        error(`${prefix}: sections array is empty`);
      } else {
        g.sections.forEach((s, si) => {
          if (!s.heading) error(`${prefix} sections[${si}]: missing "heading"`);
          if (Array.isArray(s.products)) {
            s.products.forEach((p, pi) => {
              const pprefix = `${prefix} sections[${si}].products[${pi}] ("${p.name || '?'}")`;
              if (!p.name)      error(`${pprefix}: missing "name"`);
              if (!p.affiliate) error(`${pprefix}: missing "affiliate"`);
              if (p.affiliate) {
                if (p.affiliate === TODO_AFFILIATE) {
                  // FIX: stub placeholder URLs are a warning, not a build-blocking error.
                  // The build can proceed; the link will be non-functional until replaced.
                  warn(`${pprefix}: affiliate is a stub placeholder — replace with real URL before publishing`);
                } else if (!p.affiliate.startsWith('https://')) {
                  error(`${pprefix}: affiliate must be https`);
                }
              }
            });
          }
        });
      }
    }
  });
}


// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function runValidation() {
  errorCount = 0;
  console.log('\n🔍 Running data validation...\n');

  const products    = loadJSON('products.json');
  const collections = loadJSON('collections.json');
  const comparisons = loadJSON('comparisons.json');
  const guides      = loadJSON('guides.json');

  const productIds = products    ? validateProducts(products)          : new Set();
  if (collections)                 validateCollections(collections, productIds);
  if (comparisons)                 validateComparisons(comparisons);
  if (guides)                      validateGuides(guides);

  if (errorCount === 0) {
    const counts = [
      products    ? `${products.length} products`       : null,
      collections ? `${collections.length} collections` : null,
      comparisons ? `${comparisons.length} comparisons` : null,
      guides      ? `${guides.length} guides`           : null,
    ].filter(Boolean).join(', ');
    console.log(`  ✓ All checks passed — ${counts}\n`);
    return true;
  } else {
    console.error(`\n  ❌ ${errorCount} error${errorCount === 1 ? '' : 's'} found. Fix before building.\n`);
    return false;
  }
}

if (require.main === module) {
  const ok = runValidation();
  if (!ok) process.exit(1);
}

module.exports = { runValidation };
