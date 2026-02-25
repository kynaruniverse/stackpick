'use strict';
const fs = require('fs');
const path = require('path');

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Modularized: Shared Paragraph Builder */
function paragraphs(text, indent = '') {
  if (!text) return '';
  return text.split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => `${indent}<p>${escapeHtml(l)}</p>`).join('\n');
}

/** Modularized: The "Category" Card (Used in Mice, Keyboards, etc.) */
function buildCategoryCard(product, badgeColors = {}) {
  const badgeStyle = badgeColors[product.id] ? ` style="background:${escapeHtml(badgeColors[product.id])};"` : '';
  const rrpBlock = product.msrp ? `\n<span class="price-rrp-wrap"><span class="price-rrp-label">RRP</span><span class="price-rrp">${escapeHtml(product.msrp)}</span></span><span class="price-saving">${escapeHtml(product.savings || '')}</span>` : '';
  const pros = product.pros.map(p => `<li class="pro"><span class="pro-icon">✓</span> ${escapeHtml(p)}</li>`).join('\n');
  const cons = product.cons.map(c => `<li class="con"><span class="con-icon">✕</span> ${escapeHtml(c)}</li>`).join('\n');

  return `
    <div class="product-card">
      <div class="product-image-placeholder">${escapeHtml(product.emoji)}</div>
      <div class="product-content">
        <span class="product-badge"${badgeStyle}>${escapeHtml(product.badge)}</span>
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
        <div class="product-price-block">
          <span class="price-current-label">Amazon price</span>
          <span class="price-current">${escapeHtml(product.price)}</span>${rrpBlock}
        </div>
        <p class="product-desc">${escapeHtml(product.desc)}</p>
        <ul class="product-features">${pros}\n${cons}</ul>
        <a href="${escapeHtml(product.affiliate)}" target="_blank" rel="noopener sponsored" class="product-btn">View on Amazon →</a>
      </div>
    </div>`;
}

/** Modularized: The "Comparison" Table Builder */
function buildSpecTableHTML(specTable) {
  return specTable.map(({ label, a, b, winner }) => {
    const tdA = winner === 'a' ? `<td class="comparison-winner">${escapeHtml(a)}</td>` : `<td>${escapeHtml(a)}</td>`;
    const tdB = winner === 'b' ? `<td class="comparison-winner">${escapeHtml(b)}</td>` : `<td>${escapeHtml(b)}</td>`;
    return `<tr><td>${escapeHtml(label)}</td>${tdA}${tdB}</tr>`;
  }).join('\n');
}

// ... include your existing render() and renderPage() functions here ...

module.exports = { render, renderPage, writeFile, escapeHtml, paragraphs, buildCategoryCard, buildSpecTableHTML };
