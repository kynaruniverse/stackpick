import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://stackpick.co.uk',
  output: 'static',
  integrations: [sitemap()],
  build: {
    assets: 'assets'
  }