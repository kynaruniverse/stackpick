import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Main site URL
  site: 'https://stackpick.co.uk',
  
  // Best for SEO and GitHub Pages consistency
  trailingSlash: 'always',

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        return item;
      }
    })
  ],

  build: {
    assets: 'assets',
    inlineStylesheets: 'always'
  },

  output: 'static'
});
