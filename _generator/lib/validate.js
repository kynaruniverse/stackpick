'use strict';

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../_data');

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
// Configuration
// ---------------------------------------------------------------------------
const REQUIRED_PRODUCT_FIELDS = [
  'id', 'category', 'brand', 'badge', 'name', 'shortName',
  'specs', 'desc', 'pros', 'cons',
  'price', 'priceRaw', 'affiliate',
  'url', 'emoji', 'inStock'
];

// Re-added your specific custom fields
const EXTRA_FIELDS = ['seam', 'loadoutCount', 'tags'];

const VALID_CATEGORIES = ['mice', 'keyboards', 'headsets', 'monitors', 'chairs', 'desks', 'speakers', 'pcs', 'extras'];
const VALID_SEAMS = ['crimson', 'cobalt', 'slate', 'amber', 'jade'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------------------
// Product validation
// ---------------------------------------------------------------------------
function validateProducts(products) {
  if (!Array.isArray(products)) { error('products.json must be an array'); return new Set(); }

  const ids = new Set();
  products.forEach((p, i) => {
    const prefix = `products[${i}] (${p.id || 'unknown'})`;

    // Check all required core fields
    REQUIRED_PRODUCT_FIELDS.forEach(field => {
      if (p[field] === undefined || p[field] === null || p[field] === '') {
        error(`${prefix}: missing required field "${field}"`);
      }
    });

    // Check your extra fields
    EXTRA_FIELDS.forEach(field => {
        if (p[field] === undefined) error(`${prefix}: missing extra field "${field}"`);
    });

    if (p.id && ids.has(p.id)) error(`${prefix}: duplicate id "${p.id}"`);
    if (p.id) ids.add(p.id);

    if (p.category && !VALID_CATEGORIES.includes(p.category)) {
      error(`${prefix}: invalid category "${p.category}"`);
    }

    if (p.seam && !VALID_SEAMS.includes(p.seam)) {
        error(`${prefix}: invalid seam "${p.seam}"`);
    }

    if (p.affiliate && !p.affiliate.startsWith('https://')) {
      error(`${prefix}: affiliate link must be secure (https)`);
    }

    if (typeof p.priceRaw !== 'number') {
      error(`${prefix}: priceRaw must be a number`);
    }
  });

  return ids;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function runValidation() {
  errorCount = 0;
  console.log('\n🔍 Running Strict Data Validation...\n');

  const products    = loadJSON('products.json');
  const collections = loadJSON('collections.json');
  const comparisons = loadJSON('comparisons.json');

  const productIds = products ? validateProducts(products) : new Set();
  
  // Cross-reference check
  if (collections) {
    collections.forEach(c => {
      if (c.baseProducts) {
        c.baseProducts.forEach(id => {
          if (!productIds.has(id)) error(`collections.json: references unknown product "${id}"`);
        });
      }
    });
  }

  if (errorCount === 0) {
    console.log(`  ✓ Data integrity check passed.\n`);
    return true;
  } else {
    console.error(`\n❌ Found ${errorCount} errors. Fix these before building.\n`);
    return false;
  }
}

if (require.main === module) {
  const ok = runValidation();
  if (!ok) process.exit(1);
}

module.exports = { runValidation };
