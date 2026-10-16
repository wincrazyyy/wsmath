// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wsmath.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  server: { port: 4321 },
  preview: { port: 4321 },
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
