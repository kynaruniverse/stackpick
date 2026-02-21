'use strict';

/**
 * StackPick render.js — lightweight template engine
 *
 * Supports:
 *   {{varName}}                     — simple variable substitution (HTML-escaped)
 *   {{{varName}}}                   — raw/unescaped output (for HTML blobs like schemaJSON)
 *   {{#each arrayName}}...{{/each}} — loop over array; use {{this}} for primitive values
 *                                     or {{propName}} for object properties
 *   {{#if varName}}...{{/if}}       — conditional block (truthy check)
 *   {{#if_active "slug" activePage}}...{{/if_active}} — outputs content if slug === activePage
 *
 * No dependencies — Node.js built-ins only.
 */

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// HTML escape — used for all {{var}} substitutions
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

// ---------------------------------------------------------------------------
// Core render — takes a template string and a data object, returns HTML string
// ---------------------------------------------------------------------------
function render(template, data) {
  let out = template;

  // 1. {{#each arrayName}} ... {{/each}}
  out = out.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, block) => {
    const arr = data[key];
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return arr.map(item => {
      if (typeof item === 'object' && item !== null) {
        // render the inner block with item properties as data
        return render(block, Object.assign({}, data, item));
      }
      // primitive — expose as {{this}}
      return render(block, Object.assign({}, data, { this: item }));
    }).join('');
  });

  // 2. {{#if_active "slug" varName}} ... {{/if_active}}
  out = out.replace(/\{\{#if_active\s+"([^"]+)"\s+(\w+)\}\}([\s\S]*?)\{\{\/if_active\}\}/g,
    (_, slug, varName, block) => {
      return data[varName] === slug ? block : '';
    }
  );

  // 3. {{#if varName}} ... {{/if}}
  out = out.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, block) => {
    return data[key] ? render(block, data) : '';
  });

  // 4. {{{rawVar}}} — triple braces, no escaping (for JSON-LD blobs, etc.)
  out = out.replace(/\{\{\{(\w+)\}\}\}/g, (_, key) => {
    const val = data[key];
    return val !== undefined && val !== null ? String(val) : '';
  });

  // 5. {{var}} — escaped substitution
  out = out.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = data[key];
    return val !== undefined && val !== null ? escapeHtml(String(val)) : '';
  });

  return out;
}

// ---------------------------------------------------------------------------
// renderFile — load a template file and render it with data
// ---------------------------------------------------------------------------
function renderFile(templatePath, data) {
  const template = fs.readFileSync(templatePath, 'utf8');
  return render(template, data);
}

// ---------------------------------------------------------------------------
// renderPage — assemble a full page from partials + a main template
//
// Usage:
//   renderPage({
//     partialsDir : path to _templates/_partials/
//     template    : full HTML string for the page body area
//     data        : object passed to all render calls
//   })
//
// The partials (head, header, sidebar, footer, bottom-nav) are rendered
// individually with the same data object, then concatenated.
// ---------------------------------------------------------------------------
function renderPage({ partialsDir, template, data }) {
  const partial = name =>
    renderFile(path.join(partialsDir, name + '.html'), data);

  return [
    partial('head'),
    partial('header'),
    partial('sidebar'),
    '  <div class="page-wrapper">',
    render(template, data),
    partial('footer'),
    '  </div><!-- end .page-wrapper -->',
    partial('bottom-nav'),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// writeFile — write output HTML, creating directories as needed
// ---------------------------------------------------------------------------
function writeFile(outputPath, content) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf8');
}

module.exports = { render, renderFile, renderPage, writeFile, escapeHtml };
