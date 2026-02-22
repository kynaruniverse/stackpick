'use strict';

/**
 * StackPick render.js — lightweight template engine
 *
 * Supports:
 *   {{varName}}                     — simple variable substitution (HTML-escaped)
 *   {{{varName}}}                   — raw/unescaped output (for HTML blobs like schemaJSON)
 *   {{#each arrayName}}...{{/each}} — loop over array; use {{this}} for primitive values
 *                                     or {{propName}} for object properties
 *   {{#if varName}}...{{/if}}       — conditional block (truthy check); nesting supported
 *   {{#if_active "slug" activePage}}...{{/if_active}} — outputs content if slug === activePage
 *
 * No dependencies — Node.js built-ins only.
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// HTML escape — used for all {{var}} substitutions
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Core render — takes a template string and a data object, returns HTML string
// ---------------------------------------------------------------------------
function render(template, data) {
  let out = template;
  
  // 1. {{#each arrayName}} ... {{/each}}
  //    Processed first so nested inner directives are resolved via recursive render().
  out = out.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, block) => {
    const arr = data[key];
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return arr.map(item => {
      const ctx = (typeof item === 'object' && item !== null) ?
        Object.assign({}, data, item) // item properties override parent scope
        :
        Object.assign({}, data, { this: item }); // primitive — expose as {{this}}
      return render(block, ctx);
    }).join('');
  });
  
  // 2. {{#if_active "slug" varName}} ... {{/if_active}}
  //    Block is passed through render() so inner {{var}}, {{#if}}, {{#each}}
  //    directives inside the active branch are fully expanded.
  out = out.replace(
    /\{\{#if_active\s+"([^"]+)"\s+(\w+)\}\}([\s\S]*?)\{\{\/if_active\}\}/g,
    (_, slug, varName, block) => data[varName] === slug ? render(block, data) : ''
  );
  
  // 3. {{#if varName}} ... {{/if}}
  //    Processed innermost-first (leaf blocks with no nested {{#if}} inside them)
  //    by repeating until the string stabilises. This correctly handles any depth
  //    of nesting without requiring a full recursive-descent parser.
  //    A "leaf" {{#if}} is one whose content contains no further {{#if ...}} opener.
  const leafIfRe = /\{\{#if\s+(\w+)\}\}((?:(?!\{\{#if\s)[\s\S])*?)\{\{\/if\}\}/g;
  let prev;
  do {
    prev = out;
    out = out.replace(leafIfRe, (_, key, block) =>
      data[key] ? render(block, data) : ''
    );
  } while (out !== prev);
  
  // 4. {{{rawVar}}} — triple braces, no escaping (for JSON-LD blobs, pre-built HTML, etc.)
  //    Must run before step 5 to avoid the double-brace regex partially consuming these.
  out = out.replace(/\{\{\{(\w+)\}\}\}/g, (_, key) => {
    const val = data[key];
    return val !== undefined && val !== null ? String(val) : '';
  });
  
  // 5. {{var}} — escaped substitution (runs last, catches any vars exposed by earlier steps)
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
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  let template;
  try {
    template = fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read template "${templatePath}": ${err.message}`);
  }
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
// DOM structure (outermost → innermost):
//   head partial
//   header partial
//   sidebar partial
//   <div class="page-wrapper">
//     [page template content]
//   </div>
//   footer partial
//   bottom-nav partial
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
    '  </div><!-- end .page-wrapper -->',
    partial('footer'),
    partial('bottom-nav'),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// writeFile — write output HTML, creating directories as needed
// ---------------------------------------------------------------------------
function writeFile(outputPath, content) {
  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf8');
  } catch (err) {
    throw new Error(`Failed to write "${outputPath}": ${err.message}`);
  }
}

module.exports = { render, renderFile, renderPage, writeFile, escapeHtml };