'use strict';

/**
 * StackPick generate-sitemap.js
 *
 * Reads:  _data/comparisons.json
 *         _data/guides.json
 * Writes: sitemap.xml  (repo root)
 *
 * Static pages are hardcoded here — they don't change.
 * Dynamic pages (comparisons, guides) are read from data files.
 *
 * Run standalone: node _generator/generate-sitemap.js
 * Called by:      _generator/build.js (Step 5)
 */

const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..');
const DATA_DIR    = path.join(ROOT, '_data');
const BASE_URL    = 'https://stackpick.co.uk';
const TODAY       = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Escape a string for safe inclusion in an XML text node / attribute. */
function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');
}

/**
 * Return `date` if it is a valid YYYY-MM-DD string, otherwise fall back to `fallback`.
 * Prevents malformed lastmod values from data files corrupting the XML.
 */
function safeDate(date, fallback) {
  return (date && ISO_DATE_RE.test(date)) ? date : (fallback || TODAY);
}

/** Load and parse a JSON data file with a descriptive error on failure. */
function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`generate-sitemap: missing data file "${filePath}"`);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`generate-sitemap: invalid JSON in "${filePath}": ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Static pages — order matters (priority high → low)
//
// NOTE: Pages marked placeholder:true are "coming soon" sections not yet live.
// They are included in the sitemap at low priority to allow Google to discover
// them early, but should be removed or updated once the pages go live.
// ---------------------------------------------------------------------------
const STATIC_PAGES = [
  { loc: '/',             changefreq: 'daily',   priority: '1.0' },
  { loc: '/mice/',        changefreq: 'weekly',  priority: '0.9' },
  { loc: '/keyboards/',   changefreq: 'weekly',  priority: '0.9' },
  { loc: '/headsets/',    changefreq: 'weekly',  priority: '0.9' },
  { loc: '/monitors/',    changefreq: 'weekly',  priority: '0.9' },
  { loc: '/chairs/',      changefreq: 'weekly',  priority: '0.9' },
  { loc: '/guides/',      changefreq: 'weekly',  priority: '0.8' },
  { loc: '/comparisons/', changefreq: 'weekly',  priority: '0.7' },
  { loc: '/search/',      changefreq: 'weekly',  priority: '0.6' },
  { loc: '/about/',       changefreq: 'monthly', priority: '0.5' },
  { loc: '/pcs/',         changefreq: 'monthly', priority: '0.5', placeholder: true },
  { loc: '/desks/',       changefreq: 'monthly', priority: '0.5', placeholder: true },
  { loc: '/speakers/',    changefreq: 'monthly', priority: '0.5', placeholder: true },
  { loc: '/extras/',      changefreq: 'monthly', priority: '0.5', placeholder: true },
];

// ---------------------------------------------------------------------------
// Build <url> block
// ---------------------------------------------------------------------------
function urlBlock(loc, changefreq, priority, lastmod) {
  // Validate priority is within the 0.0–1.0 range required by the sitemap spec.
  // Fall back to '0.5' for any out-of-range or non-numeric value from data.
  const p = parseFloat(priority);
  const safePriority = (!isNaN(p) && p >= 0.0 && p <= 1.0)
    ? priority
    : '0.5';

  return [
    '  <url>',
    `    <loc>${escapeXml(BASE_URL)}${escapeXml(loc)}</loc>`,
    `    <lastmod>${safeDate(lastmod)}</lastmod>`,
    `    <changefreq>${escapeXml(changefreq)}</changefreq>`,
    `    <priority>${escapeXml(safePriority)}</priority>`,
    '  </url>',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Build full sitemap
// ---------------------------------------------------------------------------
function buildSitemap(comparisons, guides) {
  const blocks = [];

  // Static pages
  for (const p of STATIC_PAGES) {
    blocks.push(urlBlock(p.loc, p.changefreq, p.priority));
  }

  // Guide pages (dynamic) — sorted by dateModified/datePublished descending
  for (const guide of guides) {
    const lastmod = safeDate(guide.dateModified || guide.datePublished);
    blocks.push(urlBlock(
      `/guides/${guide.slug}/`,
      'monthly',
      '0.8',
      lastmod
    ));
  }

  // Comparison pages (dynamic) — sorted by dateModified/datePublished descending
  for (const comp of comparisons) {
    const lastmod = safeDate(comp.dateModified || comp.datePublished);
    blocks.push(urlBlock(
      `/comparisons/${comp.slug}/`,
      'monthly',
      '0.7',
      lastmod
    ));
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...blocks,
    '</urlset>',
    '', // trailing newline
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
function run() {
  const comparisons = loadJSON('comparisons.json');
  const guides      = loadJSON('guides.json');

  const xml     = buildSitemap(comparisons, guides);
  const outPath = path.join(ROOT, 'sitemap.xml');

  try {
    fs.writeFileSync(outPath, xml, 'utf8');
  } catch (err) {
    throw new Error(`generate-sitemap: failed to write "${outPath}": ${err.message}`);
  }

  const total = STATIC_PAGES.length + guides.length + comparisons.length;
  console.log(`  ✓ sitemap.xml — ${total} URLs`);
}

// FIX: guard with require.main to prevent auto-execution when imported by build.js
if (require.main === module) {
  run();
}

module.exports = { run };
