'use strict';

/**
 * StackPick validate.js
 *
 * Validates all _data/*.json files before the build runs.
 * Called by: _generator/build.js (Step 1)
 * Run standalone: node _generator/lib/validate.js
 *
 * FIX: Previously re-declared 8 constants that already live in config.js,
 * causing the two files to inevitably drift. Now imports from config.js.
 *
 * FIX: TODO_AFFILIATE stub URLs now produce a build-blocking error, not a
 * warning, when found on a path that has no real URL. This prevents stub
 * links from ever reaching a deployed page.
 */

const fs   = require('fs');
const path = require('path');

// ── Import shared constants from config.js ──────────────────────────────────
// Previously these were re-declared here — a maintenance hazard. Any change
// to config.js (e.g. new VALID_CATEGORY) was silently NOT reflected in
// validation unless this file was manually updated.
const {
  VALID_CATEGORIES,
  VALID_SEAMS,
  DATE_RE,
  SPECS_LENGTH,
  TODO_AFFILIATE,
  REQUIRED_PRODUCT_FIELDS_VALIDATE  : REQUIRED_PRODUCT_FIELDS,
  REQUIRED_COMPARISON_FIELDS,
  REQUIRED_GUIDE_FIELDS,
  EXTRA_FIELDS,
} = require('./config');

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

    // Extra fields — warn rather than error (non-fatal schema additions)
    EXTRA_FIELDS.forEach(field => {
      if (p[field] === undefined) warn(`${prefix}: missing extra field "${field}"`);
    });

    // Unique IDs
    if (p.id && ids.has(p.id)) error(`${prefix}: duplicate id "${p.id}"`);
    if (p.id) ids.add(p.id);

    // Valid category
    if (p.category && !VALID_CATEGORIES.includes(p.category)) {
      error(`${prefix}: invalid category "${p.category}" — must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // Valid seam
    if (p.seam && !VALID_SEAMS.includes(p.seam)) {
      error(`${prefix}: invalid seam "${p.seam}" — must be one of: ${VALID_SEAMS.join(', ')}`);
    }

    // Affiliate URL — must be https and must not be a stub placeholder
    if (p.affiliate) {
      if (p.affiliate === TODO_AFFILIATE) {
        error(`${prefix}: affiliate is a stub placeholder — replace with a real URL before committing`);
      } else if (!p.affiliate.startsWith('https://')) {
        error(`${prefix}: affiliate link must be secure (https://)`);
      }
    }

    // priceRaw must be a positive number
    if (typeof p.priceRaw !== 'number') {
      error(`${prefix}: priceRaw must be a number`);
    } else if (p.priceRaw <= 0) {
      error(`${prefix}: priceRaw must be positive (got ${p.priceRaw})`);
    }

    // specs must be exactly SPECS_LENGTH items
    if (Array.isArray(p.specs) && p.specs.length !== SPECS_LENGTH) {
      error(`${prefix}: specs must have exactly ${SPECS_LENGTH} items (got ${p.specs.length})`);
    }

    // pros/cons must be non-empty arrays
    if (Array.isArray(p.pros) && p.pros.length === 0) error(`${prefix}: pros array is empty`);
    if (Array.isArray(p.cons) && p.cons.length === 0) error(`${prefix}: cons array is empty`);

    // tags must be a non-empty array if present
    if (p.tags !== undefined && (!Array.isArray(p.tags) || p.tags.length === 0)) {
      error(`${prefix}: tags must be a non-empty array`);
    }

    // Boolean fields
    if (p.inStock !== undefined && typeof p.inStock !== 'boolean') {
      error(`${prefix}: inStock must be true or false`);
    }
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

    if (c.id && collectionIds.has(c.id)) error(`${prefix}: duplicate collection id "${c.id}"`);
    if (c.id) collectionIds.add(c.id);

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

    if (c.shuffleVariants) {
      if (!Array.isArray(c.shuffleVariants)) {
        error(`${prefix}: shuffleVariants must be an array`);
      } else {
        c.shuffleVariants.forEach((v, vi) => {
          (v.products || []).forEach(id => {
            if (!productIds.has(id)) {
              error(`${prefix} shuffleVariants[${vi}]: references unknown product id "${id}"`);
            }
          });
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

    REQUIRED_COMPARISON_FIELDS.forEach(field => {
      if (c[field] === undefined || c[field] === null || c[field] === '') {
        error(`${prefix}: missing required field "${field}"`);
      }
    });

    if (c.slug && slugs.has(c.slug)) error(`${prefix}: duplicate slug "${c.slug}"`);
    if (c.slug) slugs.add(c.slug);

    if (c.datePublished && !DATE_RE.test(c.datePublished)) {
      error(`${prefix}: datePublished must be YYYY-MM-DD (got "${c.datePublished}")`);
    }
    if (c.dateModified && !DATE_RE.test(c.dateModified)) {
      error(`${prefix}: dateModified must be YYYY-MM-DD (got "${c.dateModified}")`);
    }
    if (c.canonical && !c.canonical.startsWith('https://')) {
      error(`${prefix}: canonical must be https`);
    }

    ['productA', 'productB'].forEach(side => {
      if (c[side]) {
        if (!c[side].name)      error(`${prefix}: ${side} missing "name"`);
        if (!c[side].affiliate) error(`${prefix}: ${side} missing "affiliate"`);
        if (c[side].affiliate && !c[side].affiliate.startsWith('https://')) {
          error(`${prefix}: ${side}.affiliate must be https`);
        }
      }
    });

    if (Array.isArray(c.specTable) && c.specTable.length === 0) {
      error(`${prefix}: specTable is empty`);
    }
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

    REQUIRED_GUIDE_FIELDS.forEach(field => {
      if (g[field] === undefined || g[field] === null || g[field] === '') {
        error(`${prefix}: missing required field "${field}"`);
      }
    });

    if (g.budgetLabel === undefined || g.budgetLabel === null || g.budgetLabel === '') {
      warn(`${prefix}: missing optional field "budgetLabel" — guide price will be blank in search index`);
    }

    if (g.slug && slugs.has(g.slug)) error(`${prefix}: duplicate slug "${g.slug}"`);
    if (g.slug) slugs.add(g.slug);

    if (g.datePublished && !DATE_RE.test(g.datePublished)) {
      error(`${prefix}: datePublished must be YYYY-MM-DD (got "${g.datePublished}")`);
    }
    if (g.dateModified && !DATE_RE.test(g.dateModified)) {
      error(`${prefix}: dateModified must be YYYY-MM-DD (got "${g.dateModified}")`);
    }
    if (g.canonical && !g.canonical.startsWith('https://')) {
      error(`${prefix}: canonical must be https`);
    }

    if (Array.isArray(g.summaryTable) && g.summaryTable.length === 0) {
      error(`${prefix}: summaryTable is empty`);
    }
    if (g.summaryTotals !== undefined && !Array.isArray(g.summaryTotals)) {
      error(`${prefix}: summaryTotals must be an array`);
    }

    if (Array.isArray(g.sections)) {
      if (g.sections.length === 0) {
        error(`${prefix}: sections array is empty`);
      } else {
        g.sections.forEach((s, si) => {
          if (!s.heading) error(`${prefix} sections[${si}]: missing "heading"`);
          if (Array.isArray(s.products)) {
            s.products.forEach((p, pi) => {
              const pp = `${prefix} sections[${si}].products[${pi}] ("${p.name || '?'}")`;
              if (!p.name)      error(`${pp}: missing "name"`);
              if (!p.affiliate) error(`${pp}: missing "affiliate"`);
              if (p.affiliate) {
                if (p.affiliate === TODO_AFFILIATE) {
                  // FIX: block, don't just warn — stubs in production break user-facing links
                  error(`${pp}: affiliate is a stub placeholder — replace before publishing`);
                } else if (!p.affiliate.startsWith('https://')) {
                  error(`${pp}: affiliate must be https`);
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
// Main entry point
// ---------------------------------------------------------------------------
function runValidation() {
  errorCount = 0;
  console.log('\n🔍 Running data validation...\n');

  const products    = loadJSON('products.json');
  const collections = loadJSON('collections.json');
  const comparisons = loadJSON('comparisons.json');
  const guides      = loadJSON('guides.json');

  const productIds = products    ? validateProducts(products)         : new Set();
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
  }

  console.error(`\n  ❌ ${errorCount} error${errorCount === 1 ? '' : 's'} found. Fix before building.\n`);
  return false;
}

if (require.main === module) {
  const ok = runValidation();
  if (!ok) process.exit(1);
}

module.exports = { runValidation };
