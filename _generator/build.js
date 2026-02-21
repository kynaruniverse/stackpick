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
 *   3. (Phase 4) Generate comparison pages
 *   4. (Phase 5) Generate guide pages
 *   5. (Phase 6) Generate sitemap + export JS data files
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
console.log('Step 2 — Generating category pages...');
require('./generate-categories.js');

// ---------------------------------------------------------------------------
// Steps 3–5 will be added in Phases 4, 5, 6
// Stubs below so the build completes without errors
// ---------------------------------------------------------------------------
console.log('\nStep 3 — Comparisons  (Phase 4 — not yet built)');
console.log('Step 4 — Guides       (Phase 5 — not yet built)');
console.log('Step 5 — Sitemap      (Phase 6 — not yet built)');

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------
const elapsed = ((Date.now() - start) / 1000).toFixed(2);
console.log(`\n✅ Build complete in ${elapsed}s\n`);
