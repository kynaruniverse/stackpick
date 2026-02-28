import fs from 'fs';
import path from 'path';

// Define your source of truth
const ALLOWED_CATEGORIES = ['mice', 'keyboards', 'headsets', 'monitors', 'chairs'];
const CONTENT_PATH = './src/content/products';

console.log("🔍 Starting Category Validation...");

try {
  const files = fs.readdirSync(CONTENT_PATH).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  let errorCount = 0;

  files.forEach(file => {
    const content = fs.readFileSync(path.join(CONTENT_PATH, file), 'utf8');
    
    // Look for the category line in frontmatter
    const match = content.match(/category:\s*["']?([^"'\n]+)["']?/);
    
    if (match) {
      const category = match[1].trim();
      if (!ALLOWED_CATEGORIES.includes(category)) {
        console.error(`❌ ERROR: File "${file}" has invalid category: "${category}"`);
        errorCount++;
      }
    } else {
      console.warn(`⚠️ WARNING: File "${file}" is missing a category field.`);
    }
  });

  if (errorCount === 0) {
    console.log("✅ All products have valid categories! Your build is safe.");
  } else {
    console.log(`\nFound ${errorCount} errors. Please fix these to ensure they appear on the site.`);
  }
} catch (err) {
  console.error("Could not read products directory. Check your path.");
}
