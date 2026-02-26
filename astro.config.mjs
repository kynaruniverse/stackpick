import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://stackpick.co.uk',
  output: 'static',
  build: {
    assets: 'assets'
  }
});