// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wsmath.com',
  output: 'static',
  // The Cloudflare Pages project publishes out/ (its setting from before the move to Astro), so the build writes there.
  outDir: './out',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  server: { port: 4321 },
  preview: { port: 4321 },
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
