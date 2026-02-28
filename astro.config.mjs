import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // The most important line for sitemaps
  site: 'https://stackpick.co.uk',
  
  integrations: [sitemap()],

  build: {
    assets: 'assets'
  },

  // Ensures your static site works perfectly on GitHub Pages
  output: 'static'
});
