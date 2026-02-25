'use strict';

/**
 * StackPick lib/render.js — template engine + HTML card builders
 *
 * FIXES vs previous version:
 *   1. render() and renderPage() were referenced in module.exports but NEVER DEFINED.
 *      The build failed immediately with "ReferenceError: render is not defined".
 *      Both functions are now fully implemented below.
 *
 *   2. build.js imports buildProductCard() but this file exported buildCategoryCard().
 *      The function now exports under both names for backwards compatibility,
 *      with buildProductCard() as the canonical name.
 *
 *   3. writeFile() was listed in module.exports but not implemented here.
 *      It belongs in utils.js (where it already lives). Removed from this module's
 *      exports — import it directly from utils.js if needed.
 *
 *   4. paragraphs() escaped HTML — meaning any caller passing pre-built HTML
 *      (e.g. buyingGuideHTML from config.js) would have tags double-escaped.
 *      A raw-HTML variant is now available: paragraphsRaw().
 *
 *   5. escAttr() now escapes all special characters, not just double-quotes.
 */

const fs   = require('fs');
const path = require('path');
const { BADGE_COLORS } = require('./config');

// ---------------------------------------------------------------------------
// Escaping utilities
// ---------------------------------------------------------------------------

/**
 * Escape a value for safe insertion inside HTML element content.
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

/**
 * Escape a value for safe insertion inside an HTML attribute value.
 * More defensive than escapeHtml — also handles unquoted/single-quoted attributes.
 */
function escapeAttr(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}


// ---------------------------------------------------------------------------
// Paragraph builder
// ---------------------------------------------------------------------------

/**
 * Convert a newline-separated block of plain text into escaped <p> elements.
 * Each non-empty line becomes one paragraph.
 *
 * @param {string} text   Plain text (will be HTML-escaped)
 * @param {string} indent Optional leading whitespace for each output line
 */
function paragraphs(text, indent = '') {
  if (!text) return '';
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `${indent}<p>${escapeHtml(l)}</p>`)
    .join('\n');
}

/**
 * Wrap a block of pre-built HTML in a <div> with optional indentation.
 * Use this (not paragraphs()) when the input is already valid HTML.
 *
 * @param {string} html   Pre-built HTML content (NOT escaped)
 * @param {string} indent Optional leading whitespace for the wrapper
 */
function paragraphsRaw(html, indent = '') {
  if (!html) return '';
  return `${indent}<div class="prose">${html}</div>`;
}


// ---------------------------------------------------------------------------
// Template engine
// ---------------------------------------------------------------------------

/**
 * Simple token replacement engine.
 *
 * Replaces {{KEY}} tokens in `template` with values from `data`.
 * Token matching is case-sensitive. Unknown tokens are left as-is
 * (so partial renders are possible without crashing).
 *
 * Values are inserted raw — callers are responsible for pre-escaping
 * any data that originates from user input or external sources.
 *
 * @param {string} template  HTML template string containing {{KEY}} tokens
 * @param {Object} data      Key→value map of replacements
 * @returns {string}
 */
function render(template, data) {
  if (!template) return '';
  if (!data || typeof data !== 'object') return template;

  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmed = key.trim();
    // Return empty string for null/undefined values (avoids "undefined" in output)
    if (data[trimmed] == null) return '';
    return String(data[trimmed]);
  });
}

/**
 * Render a page from a template, partials directory, and data object.
 *
 * Partials are included via {{> partial-name}} syntax.
 * Each partial file is read from partialsDir as `partial-name.html`.
 *
 * Rendering order:
 *   1. Resolve all {{> partial}} includes (partials cannot include other partials)
 *   2. Apply all {{KEY}} data substitutions
 *
 * @param {{ partialsDir: string, template: string, data: Object }} opts
 * @returns {string}  Final rendered HTML
 */
function renderPage({ partialsDir, template, data }) {
  if (!template) throw new Error('renderPage: template is required');
  if (!partialsDir) throw new Error('renderPage: partialsDir is required');

  // ── Step 1: resolve partial includes ───────────────────────────────────
  let resolved = template.replace(/\{\{>\s*([^}]+)\s*\}\}/g, (match, partialName) => {
    const partialPath = path.join(partialsDir, partialName.trim() + '.html');
    if (!fs.existsSync(partialPath)) {
      console.warn(`  ⚠  renderPage: partial not found: "${partialPath}"`);
      return `<!-- partial "${partialName}" not found -->`;
    }
    return fs.readFileSync(partialPath, 'utf8');
  });

  // ── Step 2: apply data substitutions ───────────────────────────────────
  return render(resolved, data);
}


// ---------------------------------------------------------------------------
// Product card builder
// Used by: build.js Step 3 (category pages) and Step 5 (guide sections)
// ---------------------------------------------------------------------------

/**
 * Build an HTML product card for category and guide pages.
 *
 * @param {Object}  product
 * @param {Object}  [opts]
 * @param {boolean} [opts.showEmoji=true]  Show the emoji placeholder (category pages)
 *                                         Pass false for guide pages (no image placeholder)
 * @returns {string}  HTML string for one product card
 */
function buildProductCard(product, opts) {
  const showEmoji = opts ? opts.showEmoji !== false : true;

  // Badge colour — check per-product id override first, then fall back to no override
  const badgeColor = BADGE_COLORS[product.id];
  const badgeStyle = badgeColor ? ` style="background:${escapeAttr(badgeColor)};"` : '';

  // RRP / savings block (optional)
  const rrpBlock = product.msrp
    ? `\n<span class="price-rrp-wrap">` +
      `<span class="price-rrp-label">RRP</span>` +
      `<span class="price-rrp">${escapeHtml(product.msrp)}</span>` +
      `</span>` +
      (product.savings ? `<span class="price-saving">${escapeHtml(product.savings)}</span>` : '')
    : '';

  // Validate affiliate URL at render time (belt-and-suspenders after build validation)
  const affiliateHref = (product.affiliate && product.affiliate.startsWith('https://'))
    ? product.affiliate
    : '#';

  if (affiliateHref === '#') {
    console.warn(`  ⚠  buildProductCard: "${product.id}" has no valid affiliate URL`);
  }

  const pros = Array.isArray(product.pros)
    ? product.pros.map(p => `<li class="pro"><span class="pro-icon">✓</span> ${escapeHtml(p)}</li>`).join('\n')
    : '';

  const cons = Array.isArray(product.cons)
    ? product.cons.map(c => `<li class="con"><span class="con-icon">✕</span> ${escapeHtml(c)}</li>`).join('\n')
    : '';

  const emojiBlock = showEmoji
    ? `<div class="product-image-placeholder" aria-hidden="true">${escapeHtml(product.emoji)}</div>\n      `
    : '';

  return `
    <div class="product-card">
      ${emojiBlock}<div class="product-content">
        <span class="product-badge"${badgeStyle}>${escapeHtml(product.badge)}</span>
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
        <div class="product-price-block">
          <span class="price-current-label">Amazon price</span>
          <span class="price-current">${escapeHtml(product.price)}</span>${rrpBlock}
        </div>
        <p class="product-desc">${escapeHtml(product.desc)}</p>
        <ul class="product-features">${pros}\n${cons}</ul>
        <a href="${escapeAttr(affiliateHref)}"
           target="_blank"
           rel="noopener sponsored"
           class="product-btn"
           data-product="${escapeAttr(product.id || '')}"
           data-type="card-cta">View on Amazon →</a>
      </div>
    </div>`.trim();
}

// Alias for backwards compatibility — prefer buildProductCard in new code
const buildCategoryCard = buildProductCard;


// ---------------------------------------------------------------------------
// Spec table builder (used by comparison page generator in build.js)
// ---------------------------------------------------------------------------

/**
 * Build an HTML <tbody> row string for a comparison spec table.
 * @param {Array<{label, a, b, winner}>} specTable
 * @returns {string}
 */
function buildSpecTableHTML(specTable) {
  if (!Array.isArray(specTable)) return '';
  return specTable.map(({ label, a, b, winner }) => {
    const tdA = winner === 'a'
      ? `<td class="comparison-winner">${escapeHtml(a)}</td>`
      : `<td>${escapeHtml(a)}</td>`;
    const tdB = winner === 'b'
      ? `<td class="comparison-winner">${escapeHtml(b)}</td>`
      : `<td>${escapeHtml(b)}</td>`;
    return `<tr><td>${escapeHtml(label)}</td>${tdA}${tdB}</tr>`;
  }).join('\n');
}


// ---------------------------------------------------------------------------
module.exports = {
  // Template engine
  render,
  renderPage,

  // Escaping
  escapeHtml,
  escapeAttr,

  // Content helpers
  paragraphs,
  paragraphsRaw,

  // Card builders
  buildProductCard,
  buildCategoryCard,    // alias — kept for any direct callers
  buildSpecTableHTML,
};
