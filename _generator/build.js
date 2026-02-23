'use strict';

/**
 * StackPick build.js — main build entry point
 *
 * Usage: node _generator/build.js
 * npm run build
 *
 * Steps:
 * 0. Clean old build artifacts (folders and generated files)
 * 1. Validate all _data/*.json
 * 2. Generate category pages (mice, keyboards, headsets, monitors, chairs, etc.)
 * 3. Generate comparison pages
 * 4. Generate guide pages
 * 5. Generate sitemap.xml
 * 6. Export assets/js/data/*.js
 */

const path = require('path');
const fs = require('fs');

const start = Date.now();
console.log('\n🔨 StackPick build starting...\n');

const ROOT = path.join(__dirname, '..');

// ---------------------------------------------------------------------------
// Step 0: Clean old build artifacts
// ---------------------------------------------------------------------------
console.log('Step 0 — Cleaning old build files...');

// 1. Delete top-level category/page folders
const dirsToClean = [
  'mice', 'keyboards', 'headsets', 'monitors', 'chairs', 
  'desks', 'speakers', 'pcs', 'extras', 'search'
];

dirsToClean.forEach(dir => {
  const fullPath = path.join(ROOT, dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// 2. Delete specific generated files
const filesToClean = [
  path.join(ROOT, 'sitemap.xml'),
  path.join(ROOT, 'assets/js/data/products.js'),
  path.join(ROOT, 'assets/js/data/collections.js')
];

filesToClean.forEach(file => {
  if (fs.existsSync(file)) fs.unlinkSync(file);
});

// 3. Clean subdirectories in comparisons/guides (keeping the parent folder)
const dynamicDirs = ['comparisons', 'guides'];
dynamicDirs.forEach(parent => {
  const parentPath = path.join(ROOT, parent);
  if (fs.existsSync(parentPath)) {
    fs.readdirSync(parentPath).forEach(item => {
      const itemPath = path.join(parentPath, item);
      // We only delete directories (slug folders like /razer-vs-logitech/)
      // This preserves any manual index.html you might have in the root of these folders
      if (fs.lstatSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Step 1: Validate data
// ---------------------------------------------------------------------------
console.log('\nStep 1 — Validating data...');
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
