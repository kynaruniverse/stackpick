import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Essential for sitemap generation and canonical URLs
  site: 'https://stackpick.co.uk/',
  
  // Ensures a fully static build for GitHub Pages
  output: 'static',
  
  integrations: [
    sitemap({
      // Optional: helps ensure the sitemap is as accurate as possible
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],

  build: {
    // Keeps your dist folder organized
    assets: 'assets'
  },

  // Extension: trailingSlash ensures consistency across your internal links
  trailingSlash: 'always'
});
