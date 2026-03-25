import fs from 'fs';
import path from 'path';

const ALLOWED_CATEGORIES = ['mice', 'keyboards', 'headsets', 'monitors', 'chairs', 'controllers', 'streaming', 'desk-accessories'];
const CONTENT_PATH = './src/content/products';

console.log("🔍 Validating Content Categories...");

try {
  const files = fs.readdirSync(CONTENT_PATH).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  let errorCount = 0;

  files.forEach(file => {
    const content = fs.readFileSync(path.join(CONTENT_PATH, file), 'utf8');
    const match = content.match(/category:\s*["']?([^"'\n]+)["']?/);
    
    if (match) {
      const category = match[1].trim();
      if (!ALLOWED_CATEGORIES.includes(category)) {
        console.error(`❌ ERROR: "${file}" has invalid category: "${category}"`);
        errorCount++;
      }
    } else {
      console.warn(`⚠️ WARNING: "${file}" is missing a category field.`);
    }
  });

  if (errorCount === 0) {
    console.log("✅ All products validated! Build is safe.");
  } else {
    console.log(`\nFound ${errorCount} errors. Fix these before deploying.`);
    process.exit(1);
  }
} catch (err) {
  console.error("Error: Could not read products directory.");
}
