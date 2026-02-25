'use strict';

/**
 * StackPick lib/utils.js — shared filesystem utilities
 *
 * Replaces the 3 separate loadJSON() implementations that previously lived in:
 *   validate.js, generate-sitemap.js, export-js-data.js
 *
 * Also moves writeFile() out of render.js (where it was a pure I/O function
 * living alongside template logic) into this more appropriate home.
 */

const fs   = require('fs');
const path = require('path');

const { DATA_DIR } = require('./config');

// ---------------------------------------------------------------------------
// loadJSON
//
// Load and JSON.parse a file from _data/.
// Throws a descriptive Error on missing file or invalid JSON.
// Used by: build.js (all generation steps), validate.js
// ---------------------------------------------------------------------------
function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing data file: "${filePath}"`);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Invalid JSON in "${filePath}": ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// writeFile
//
// Write content to an output path, creating parent directories as needed.
// Throws a descriptive Error on failure.
// Moved from render.js (where it was a filesystem concern in a template module).
// ---------------------------------------------------------------------------
function writeFile(outputPath, content) {
  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, 'utf8');
  } catch (err) {
    throw new Error(`Failed to write "${outputPath}": ${err.message}`);
  }
}

module.exports = { loadJSON, writeFile };
