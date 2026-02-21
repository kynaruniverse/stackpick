'use strict';

/**
 * StackPick build.js — main build entry point
 *
 * Usage: node _generator/build.js
 *        npm run build
 *
 * Steps:
 *   1. Validate all _data/*.json
 *   2. Generate category pages (mice, keyboards, headsets, monitors, chairs)
 *   3. Generate comparison pages
 *   4. Generate guide pages
 *   5. Generate sitemap.xml + export assets/js/data/*.js
 */

const path = require('path');

const start = Date.now();
console.log('\n🔨 StackPick build starting...\n');

// ---------------------------------------------------------------------------
// Step 1: Validate data
// ---------------------------------------------------------------------------
console.log('Step 1 — Validating data...');
const { runValidation } = require('./lib/validate.js');
const valid = runValidation();
if (!valid) {
  console.error('Build aborted: fix validation errors above.\n');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 2: Category pages
// ---------------------------------------------------------------------------
console.log('\nStep 2 — Generating category pages...');
require('./generate-categories.js');

// ---------------------------------------------------------------------------
// Step 3: Comparison pages
// ---------------------------------------------------------------------------
console.log('\nStep 3 — Generating comparison pages...');
require('./generate-comparisons.js');

// ---------------------------------------------------------------------------
// Step 4: Guide pages
// ---------------------------------------------------------------------------
console.log('\nStep 4 — Generating guide pages...');
require('./generate-guides.js');

// ---------------------------------------------------------------------------
// Step 5: Sitemap + JS data export
// ---------------------------------------------------------------------------
console.log('\nStep 5 — Generating sitemap + exporting JS data files...');
require('./generate-sitemap.js');
require('./export-js-data.js');

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------
const elapsed = ((Date.now() - start) / 1000).toFixed(2);
console.log(`\n✅ Build complete in ${elapsed}s\n`);
