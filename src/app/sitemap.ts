import type { MetadataRoute } from 'next';

import { loadContent } from '@/lib/content';

/**
 * `sitemap.xml`, emitted as a static file by the export.
 *
 * One entry, because there is one page. `lastModified` is the build time — and
 * since a content edit in the editor commits to `main` and `main`
 * builds on push (editor contract §3.4), the build time *is* the last time the page
 * changed.
 */
export const dynamic = 'error';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { settings } = await loadContent();

  return [
    {
      url: `${settings.seo.siteUrl.replace(/\/+$/, '')}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
