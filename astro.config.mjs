import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Ensure no trailing spaces and a clear protocol
  site: 'https://stackpick.co.uk',
  
  // Explicitly set the directory for GitHub Pages
  outDir: './dist',
  
  // The sitemap integration needs to be initialized simply
  integrations: [sitemap()],

  // Keep assets organized
  build: {
    assets: 'assets'
  }
});
