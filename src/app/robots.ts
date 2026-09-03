import type { MetadataRoute } from 'next';

import { loadContent } from '@/lib/content';

/**
 * `robots.txt`, emitted as a static file by the export.
 *
 * Everything is crawlable: there is nothing private here, and `/preview` keeps
 * itself out of the index with its own `noindex` rather than with a `Disallow`
 * that would also stop a crawler reading that instruction.
 */
export const dynamic = 'error';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { settings } = await loadContent();
  const siteUrl = settings.seo.siteUrl.replace(/\/+$/, '');

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
