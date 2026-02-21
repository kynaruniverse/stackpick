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
 * Called by:      _generator/build.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT           = path.join(__dirname, '..');
const COMPARISONS    = JSON.parse(fs.readFileSync(path.join(ROOT, '_data', 'comparisons.json'), 'utf8'));
const GUIDES         = JSON.parse(fs.readFileSync(path.join(ROOT, '_data', 'guides.json'), 'utf8'));

const BASE_URL = 'https://stackpick.co.uk';
const TODAY    = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// ---------------------------------------------------------------------------
// Static pages — order matters (priority high → low)
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
  { loc: '/pcs/',         changefreq: 'monthly', priority: '0.5' },
  { loc: '/desks/',       changefreq: 'monthly', priority: '0.5' },
  { loc: '/speakers/',    changefreq: 'monthly', priority: '0.5' },
  { loc: '/extras/',      changefreq: 'monthly', priority: '0.5' },
];

// ---------------------------------------------------------------------------
// Build <url> block
// ---------------------------------------------------------------------------
function urlBlock(loc, changefreq, priority, lastmod) {
  return [
    '  <url>',
    `    <loc>${BASE_URL}${loc}</loc>`,
    `    <lastmod>${lastmod || TODAY}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Build full sitemap
// ---------------------------------------------------------------------------
function buildSitemap() {
  const blocks = [];

  // Static pages
  for (const p of STATIC_PAGES) {
    blocks.push(urlBlock(p.loc, p.changefreq, p.priority));
  }

  // Guide pages (dynamic)
  for (const guide of GUIDES) {
    blocks.push(urlBlock(
      `/guides/${guide.slug}/`,
      'monthly',
      '0.8',
      guide.dateModified || guide.datePublished || TODAY
    ));
  }

  // Comparison pages (dynamic)
  for (const comp of COMPARISONS) {
    blocks.push(urlBlock(
      `/comparisons/${comp.slug}/`,
      'monthly',
      '0.7',
      comp.dateModified || comp.datePublished || TODAY
    ));
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...blocks,
    '</urlset>',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
function run() {
  const xml      = buildSitemap();
  const outPath  = path.join(ROOT, 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');

  const total = STATIC_PAGES.length + GUIDES.length + COMPARISONS.length;
  console.log(`  ✓ sitemap.xml (${total} URLs)`);
}

run();
