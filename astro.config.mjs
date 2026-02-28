import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Main site URL
  site: 'https://stackpick.co.uk',
  
  // Best for SEO and GitHub Pages consistency
  trailingSlash: 'always',

  integrations: [
    sitemap({
      // The plugin now automatically pulls the URL from 'site' above.
      // We'll keep the filter logic simple to avoid the 'reduce' crash.
      filter: (page) => !page.includes('/404')
    })
  ],

  build: {
    assets: 'assets',
    inlineStylesheets: 'always'
  },

  output: 'static'
});
