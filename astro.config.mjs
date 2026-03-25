import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://stackpick.co.uk',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/offline'),
      serialize(item) {
        if (item.url.includes('/products/')) item.priority = 0.9;
        if (item.url.includes('/guides/')) item.priority = 0.8;
        return item;
      }
    })
  ],
  build: {
    assets: 'assets',
    inlineStylesheets: 'always'
  },
  compressHTML: true,
  output: 'static'
});
