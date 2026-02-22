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
 *   5. Generate sitemap.xml
 *   6. Export assets/js/data/*.js
 */

const path = require('path');

const start = Date.now();
console.log('\n🔨 StackPick build starting...\n');

// ---------------------------------------------------------------------------
// Step 1: Validate data
// NOTE: validate.js only auto-runs (and exits) when invoked directly.
//       Here we import and call runValidation() exactly once.
// ---------------------------------------------------------------------------
console.log('Step 1 — Validating data...');
const { runValidation } = require('./lib/validate');
const valid = runValidation();
if (!valid) {
  console.error('Build aborted: fix validation errors above.\n');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 2: Category pages
// ---------------------------------------------------------------------------
console.log('\nStep 2 — Generating category pages...');
try {
  require('./generate-categories').run();
} catch (err) {
  console.error('Step 2 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 3: Comparison pages
// ---------------------------------------------------------------------------
console.log('\nStep 3 — Generating comparison pages...');
try {
  require('./generate-comparisons').run();
} catch (err) {
  console.error('Step 3 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 4: Guide pages
// ---------------------------------------------------------------------------
console.log('\nStep 4 — Generating guide pages...');
try {
  require('./generate-guides').run();
} catch (err) {
  console.error('Step 4 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 5: Sitemap
// ---------------------------------------------------------------------------
console.log('\nStep 5 — Generating sitemap.xml...');
try {
  require('./generate-sitemap').run();
} catch (err) {
  console.error('Step 5 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 6: Export JS data files
// ---------------------------------------------------------------------------
console.log('\nStep 6 — Exporting JS data files...');
try {
  require('./export-js-data').run();
} catch (err) {
  console.error('Step 6 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------
const elapsed = ((Date.now() - start) / 1000).toFixed(2);
console.log(`\n✅ Build complete in ${elapsed}s\n`);
