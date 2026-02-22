'use strict';

/**
 * StackPick validate.js
 *
 * Validates _data/*.json before the build runs.
 * Exits with code 1 and a clear error message if anything is wrong.
 * Run standalone: node _generator/lib/validate.js
 * Called automatically by build.js before any generation.
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../_data');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let errorCount = 0;

function error(msg) {
  console.error(`  ✗ ${msg}`);
  errorCount++;
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
// Product validation
// ---------------------------------------------------------------------------
const REQUIRED_PRODUCT_FIELDS = [
  'id', 'category', 'brand', 'badge', 'name', 'shortName',
  'specs', 'desc', 'pros', 'cons',
  'price', 'priceRaw', 'affiliate',
  'url', 'emoji', 'seam', 'loadoutCount', 'tags',
  'inStock', 'nextDay',
];

const VALID_CATEGORIES = ['mice', 'keyboards', 'headsets', 'monitors', 'chairs'];

const VALID_SEAMS = ['crimson', 'cobalt', 'slate', 'amber', 'jade'];

// Expected url pattern: /<category>/
const EXPECTED_URL_RE = /^\/[a-z-]+\/$/;

// Expected savings pattern: numeric% e.g. "26%"
const SAVINGS_RE = /^\d+%$/;

function validateProducts(products) {
  if (!Array.isArray(products)) { error('products.json must be an array'); return new Set(); }

  const ids = new Set();
  products.forEach((p, i) => {
    const prefix = `products[${i}] (${p.id || 'unknown'})`;

    // Required field presence
    REQUIRED_PRODUCT_FIELDS.forEach(field => {
      if (p[field] === undefined || p[field] === null || p[field] === '') {
        error(`${prefix}: missing required field "${field}"`);
      }
    });

    // Duplicate id check
    if (p.id && ids.has(p.id)) error(`${prefix}: duplicate id "${p.id}"`);
    if (p.id) ids.add(p.id);

    // Category validity
    if (p.category && !VALID_CATEGORIES.includes(p.category)) {
      error(`${prefix}: invalid category "${p.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // id must start with category prefix
    if (p.id && p.category && !p.id.startsWith(p.category + '-')) {
      error(`${prefix}: id must start with category prefix "${p.category}-"`);
    }

    // affiliate must be https://
    if (p.affiliate && !p.affiliate.startsWith('https://')) {
      error(`${prefix}: affiliate link must start with https://`);
    }

    // url format
    if (p.url && !EXPECTED_URL_RE.test(p.url)) {
      error(`${prefix}: url "${p.url}" does not match expected pattern "/<slug>/"`);
    }

    // url must align with category
    if (p.url && p.category && p.url !== `/${p.category}/`) {
      error(`${prefix}: url "${p.url}" does not match category "/${p.category}/"`);
    }

    // specs must be a non-empty array
    if (!Array.isArray(p.specs) || p.specs.length === 0) {
      error(`${prefix}: specs must be a non-empty array`);
    }

    // pros must be a non-empty array
    if (!Array.isArray(p.pros) || p.pros.length === 0) {
      error(`${prefix}: pros must be a non-empty array`);
    }

    // cons must be a non-empty array
    if (!Array.isArray(p.cons) || p.cons.length === 0) {
      error(`${prefix}: cons must be a non-empty array`);
    }

    // tags must be a non-empty array
    if (!Array.isArray(p.tags) || p.tags.length === 0) {
      error(`${prefix}: tags must be a non-empty array`);
    }

    // priceRaw must be a positive number
    if (typeof p.priceRaw !== 'number' || p.priceRaw <= 0) {
      error(`${prefix}: priceRaw must be a positive number`);
    }

    // loadoutCount must be a positive integer
    if (typeof p.loadoutCount !== 'number' || !Number.isInteger(p.loadoutCount) || p.loadoutCount < 1) {
      error(`${prefix}: loadoutCount must be a positive integer`);
    }

    // inStock and nextDay must be booleans
    if (typeof p.inStock !== 'boolean') {
      error(`${prefix}: inStock must be a boolean`);
    }
    if (typeof p.nextDay !== 'boolean') {
      error(`${prefix}: nextDay must be a boolean`);
    }

    // seam must be a known value
    if (p.seam && !VALID_SEAMS.includes(p.seam)) {
      error(`${prefix}: invalid seam "${p.seam}". Must be one of: ${VALID_SEAMS.join(', ')}`);
    }

    // msrp and savings must appear together
    const hasMsrp    = p.msrp    !== undefined && p.msrp    !== null && p.msrp    !== '';
    const hasSavings = p.savings !== undefined && p.savings !== null && p.savings !== '';
    if (hasMsrp !== hasSavings) {
      error(`${prefix}: "msrp" and "savings" must both be present or both be absent`);
    }

    // savings must be a valid percentage string when present
    if (hasSavings && !SAVINGS_RE.test(p.savings)) {
      error(`${prefix}: savings "${p.savings}" must be a percentage string e.g. "26%"`);
    }
  });

  return ids;
}

// ---------------------------------------------------------------------------
// Collection validation
// ---------------------------------------------------------------------------
function validateCollections(collections, productIds) {
  if (!Array.isArray(collections)) { error('collections.json must be an array'); return; }

  const collectionIds = new Set();
  collections.forEach((c, i) => {
    const prefix = `collections[${i}] (${c.id || 'unknown'})`;

    if (!c.id)    error(`${prefix}: missing "id"`);
    if (!c.label) error(`${prefix}: missing "label"`);
    if (!c.emoji) error(`${prefix}: missing "emoji"`);
    if (!c.color) error(`${prefix}: missing "color"`);

    if (c.id && collectionIds.has(c.id)) error(`${prefix}: duplicate collection id "${c.id}"`);
    if (c.id) collectionIds.add(c.id);

    if (!Array.isArray(c.baseProducts) || c.baseProducts.length === 0) {
      error(`${prefix}: baseProducts must be a non-empty array`);
    } else if (productIds) {
      c.baseProducts.forEach(pid => {
        if (!productIds.has(pid)) error(`${prefix}: baseProducts references unknown product id "${pid}"`);
      });
    }

    if (Array.isArray(c.shuffleVariants)) {
      c.shuffleVariants.forEach((v, vi) => {
        if (!v.label) error(`${prefix} shuffleVariants[${vi}]: missing "label"`);
        if (!Array.isArray(v.products) || v.products.length === 0) {
          error(`${prefix} shuffleVariants[${vi}]: products must be a non-empty array`);
        } else if (productIds) {
          v.products.forEach(pid => {
            if (!productIds.has(pid)) {
              error(`${prefix} shuffleVariants[${vi}]: references unknown product id "${pid}"`);
            }
          });
        }
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Comparison validation
// ---------------------------------------------------------------------------
function validateComparisons(comparisons) {
  if (!Array.isArray(comparisons)) { error('comparisons.json must be an array'); return; }

  const slugs = new Set();
  comparisons.forEach((c, i) => {
    const prefix = `comparisons[${i}] (${c.slug || 'unknown'})`;

    // FIX: added 'relatedLinks' to align with generate-comparisons.js REQUIRED_FIELDS
    ['slug', 'title', 'metaTitle', 'metaDescription', 'canonical',
     'datePublished', 'intro', 'verdict', 'relatedLinks'].forEach(field => {
      if (!c[field]) error(`${prefix}: missing "${field}"`);
    });

    if (c.slug && slugs.has(c.slug)) error(`${prefix}: duplicate slug "${c.slug}"`);
    if (c.slug) slugs.add(c.slug);

    ['productA', 'productB'].forEach(side => {
      if (!c[side]) {
        error(`${prefix}: missing "${side}"`);
      } else {
        ['name', 'badge', 'price', 'affiliate'].forEach(f => {
          if (!c[side][f]) error(`${prefix}.${side}: missing "${f}"`);
        });
      }
    });

    if (!Array.isArray(c.specTable) || c.specTable.length === 0) {
      error(`${prefix}: specTable must be a non-empty array`);
    }

    if (!Array.isArray(c.sections) || c.sections.length === 0) {
      error(`${prefix}: sections must be a non-empty array`);
    }
  });
}

// ---------------------------------------------------------------------------
// Guide validation
// ---------------------------------------------------------------------------
function validateGuides(guides) {
  if (!Array.isArray(guides)) { error('guides.json must be an array'); return; }

  const slugs = new Set();
  guides.forEach((g, i) => {
    const prefix = `guides[${i}] (${g.slug || 'unknown'})`;

    ['slug', 'title', 'metaTitle', 'metaDescription', 'canonical',
     'datePublished', 'heroTitle', 'heroSubtitle'].forEach(field => {
      if (!g[field]) error(`${prefix}: missing "${field}"`);
    });

    if (g.slug && slugs.has(g.slug)) error(`${prefix}: duplicate slug "${g.slug}"`);
    if (g.slug) slugs.add(g.slug);

    if (!Array.isArray(g.summaryTable) || g.summaryTable.length === 0) {
      error(`${prefix}: summaryTable must be a non-empty array`);
    }

    if (!Array.isArray(g.sections) || g.sections.length === 0) {
      error(`${prefix}: sections must be a non-empty array`);
    }
  });
}

// ---------------------------------------------------------------------------
// Main — run all validations
// ---------------------------------------------------------------------------
function runValidation() {
  // Reset errorCount so repeated calls (e.g. in tests) produce accurate counts
  errorCount = 0;

  console.log('\n🔍 Validating _data/...\n');

  const products    = loadJSON('products.json');
  const collections = loadJSON('collections.json');
  const comparisons = loadJSON('comparisons.json');
  const guides      = loadJSON('guides.json');

  // Run each validator independently; productIds falls back to empty Set on failure
  const productIds = products ? validateProducts(products) : new Set();
  validateCollections(collections || [], productIds);
  validateComparisons(comparisons || []);
  validateGuides(guides || []);

  if (errorCount === 0) {
    console.log(`  ✓ products.json     — ${products?.length    ?? 0} products`);
    console.log(`  ✓ collections.json  — ${collections?.length ?? 0} collections`);
    console.log(`  ✓ comparisons.json  — ${comparisons?.length ?? 0} comparisons`);
    console.log(`  ✓ guides.json       — ${guides?.length      ?? 0} guides`);
    console.log('\n✅ All data valid.\n');
    return true;
  } else {
    console.error(`\n❌ ${errorCount} validation error${errorCount > 1 ? 's' : ''} found. Fix before building.\n`);
    return false;
  }
}

// Only auto-run and exit when invoked directly (node _generator/lib/validate.js).
// When imported by build.js or tests, runValidation() is called explicitly — preventing
// double execution and errorCount accumulation from a second run on top of the import.
if (require.main === module) {
  const ok = runValidation();
  if (!ok) process.exit(1);
}

module.exports = { runValidation };
