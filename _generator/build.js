'use strict';

/**
 * StackPick build.js — main build entry point
 *
 * Usage: node _generator/build.js
 * npm run build
 *
 * Steps:
 * 0.  Clean old build artifacts (folders and generated files)
 * 1.  Validate all _data/*.json
 * 2.  Stamp CSP nonce into _headers and head.html partial
 *     (must run before page generation so partials carry the correct nonce)
 * 3.  Generate category pages (mice, keyboards, headsets, monitors, chairs, etc.)
 * 4.  Generate comparison pages
 * 5.  Generate guide pages
 * 6.  Generate sitemap.xml
 * 7.  Export assets/js/data/*.js (products, collections, search-index)
 * 8.  Stamp sw.js with build-time version
 * 9.  Restore __CSP_NONCE__ placeholders in source files
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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
  'desks', 'speakers', 'pcs', 'extras',
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
  path.join(ROOT, 'assets/js/data/collections.js'),
  path.join(ROOT, 'assets/js/data/search-index.js'),
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
      // Only delete directories (slug folders like /razer-vs-logitech/).
      // Preserves any manual index.html in the root of these folders.
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
// Step 2: Stamp CSP nonce into _headers and head.html partial
//
// Must run BEFORE any page generation step so that the head.html partial
// already contains the real nonce when generate-categories / comparisons /
// guides read it via renderPage().
//
// Source files use the placeholder token __CSP_NONCE__.
// This step replaces the token with a fresh random nonce for this build.
// Step 9 (post-build) restores the placeholder so source files stay clean.
// ---------------------------------------------------------------------------
console.log('\nStep 2 — Stamping CSP nonce...');

const nonce = crypto.randomBytes(16).toString('base64');
const headersPath = path.join(ROOT, '_headers');
const headPath = path.join(ROOT, '_templates', '_partials', 'head.html');

try {
  // _headers — replace __CSP_NONCE__ placeholder
  let headersContent = fs.readFileSync(headersPath, 'utf8');
  if (!headersContent.includes('__CSP_NONCE__')) {
    throw new Error(
      '_headers is missing the __CSP_NONCE__ placeholder.\n' +
      'It may have been accidentally committed with a live nonce baked in.\n' +
      'Restore the placeholder: replace the nonce-<value> token with nonce-__CSP_NONCE__'
    );
  }
  headersContent = headersContent.replace(/__CSP_NONCE__/g, nonce);
  fs.writeFileSync(headersPath, headersContent, 'utf8');
  
  // head.html partial — replace __CSP_NONCE__ placeholder
  let headContent = fs.readFileSync(headPath, 'utf8');
  if (!headContent.includes('__CSP_NONCE__')) {
    throw new Error(
      'head.html is missing the __CSP_NONCE__ placeholder.\n' +
      'It may have been accidentally committed with a live nonce baked in.\n' +
      'Restore the placeholder: replace nonce="<value>" with nonce="__CSP_NONCE__"'
    );
  }
  headContent = headContent.replace(/__CSP_NONCE__/g, nonce);
  fs.writeFileSync(headPath, headContent, 'utf8');
  
  console.log('   🔑 CSP nonce stamped');
} catch (err) {
  console.error('Step 2 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 3: Category pages
// ---------------------------------------------------------------------------
console.log('\nStep 3 — Generating category pages...');
try {
  require('./generate-categories').run();
} catch (err) {
  console.error('Step 3 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 4: Comparison pages
// ---------------------------------------------------------------------------
console.log('\nStep 4 — Generating comparison pages...');
try {
  require('./generate-comparisons').run();
} catch (err) {
  console.error('Step 4 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 5: Guide pages
// ---------------------------------------------------------------------------
console.log('\nStep 5 — Generating guide pages...');
try {
  require('./generate-guides').run();
} catch (err) {
  console.error('Step 5 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 6: Sitemap
// ---------------------------------------------------------------------------
console.log('\nStep 6 — Generating sitemap.xml...');
try {
  require('./generate-sitemap').run();
} catch (err) {
  console.error('Step 6 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 7: Export JS data files (products, collections, search-index)
// ---------------------------------------------------------------------------
console.log('\nStep 7 — Exporting JS data files...');
try {
  require('./export-js-data').run();
} catch (err) {
  console.error('Step 7 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 8: Stamp sw.js with build-time version
// ---------------------------------------------------------------------------
console.log('\nStep 8 — Stamping sw.js with build version...');
try {
  const swPath = path.join(ROOT, 'sw.js');
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const version = `sp-${timestamp}`;
  const swContent = fs.readFileSync(swPath, 'utf8');
  fs.writeFileSync(
    swPath,
    swContent.replace(/\"sp-\d{14}\"|__SP_VERSION__/g, JSON.stringify(version))
  );
  console.log(`   🔖 SW version stamped: ${version}`);
} catch (err) {
  console.error('Step 8 failed:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 9: Restore __CSP_NONCE__ placeholders in source files
//
// The generated HTML pages (written in steps 3–5) already have the real nonce
// baked in — that is correct and intentional.
// This step restores the placeholders only in the two SOURCE files so that
// git status stays clean and the next build always finds __CSP_NONCE__ to stamp.
// ---------------------------------------------------------------------------
console.log('\nStep 9 — Restoring CSP nonce placeholders in source files...');
try {
  // Pattern matches the base64 nonce value we generated above.
  // We use the actual nonce string rather than a generic regex so we only
  // undo exactly what we wrote — nothing else in the files is touched.
  const escapedNonce = nonce.replace(/[+/=]/g, '\\$&');
  const nonceValueRe = new RegExp(escapedNonce, 'g');
  
  let h = fs.readFileSync(headersPath, 'utf8');
  fs.writeFileSync(headersPath, h.replace(nonceValueRe, '__CSP_NONCE__'), 'utf8');
  
  let p = fs.readFileSync(headPath, 'utf8');
  fs.writeFileSync(headPath, p.replace(nonceValueRe, '__CSP_NONCE__'), 'utf8');
  
  console.log('   ♻️  Placeholders restored');
} catch (err) {
  // Non-fatal — build output is still correct. Warn loudly so the developer
  // knows to manually restore the placeholder before committing.
  console.warn('\n⚠️  Step 9 warning: could not restore __CSP_NONCE__ placeholders.');
  console.warn('   Before committing, manually replace the nonce value in:');
  console.warn('     _headers           (nonce-<value> → nonce-__CSP_NONCE__)');
  console.warn('     _templates/_partials/head.html  (nonce="<value>" → nonce="__CSP_NONCE__")');
  console.warn('   Reason:', err.message);
}

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------
const elapsed = ((Date.now() - start) / 1000).toFixed(2);
console.log(`\n✅ Build complete in ${elapsed}s\n`);