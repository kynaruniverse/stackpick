import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Ensure this has NO trailing slash
  site: 'https://stackpick.co.uk',
  
  // Force trailing slash handling to be explicit
  trailingSlash: 'always',

  integrations: [
    sitemap({
      // Explicitly redundant - helps the plugin if it's 'losing' the site config
      hostname: 'https://stackpick.co.uk',
      // This empty filter often bypasses the internal 'reduce' crash
      filter: (page) => true,
      serialize(item) {
        return item;
      },
    })
  ],

  build: {
    assets: 'assets',
    inlineStylesheets: 'always'
  },

  output: 'static'
});
