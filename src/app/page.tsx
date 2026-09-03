import type { Metadata } from 'next';

import { PageView } from '@/components/page-view';
import { JsonLd } from '@/components/seo/json-ld';
import { loadContent } from '@/lib/content';

/**
 * The single page.
 *
 * Content is read, validated and token-resolved **once** here, at the server
 * boundary, and handed down as props. `loadContent` is `react/cache`-wrapped, so
 * `generateMetadata` and the component below share one read and one parse.
 *
 * Everything under `<PageView>` is server-rendered. The client islands it
 * contains (the spine, the reveal observer, the count-ups, the carousel, the
 * folder tabs, the course-outline and privacy dialogs) all receive finished,
 * serialisable props and all server-render their final content first — the
 * results matrix, the ledger, the distribution chart, the 28 quotes and the
 * eight answers are complete in this HTML with JavaScript disabled.
 *
 * `dynamic = 'error'` makes that a build-time guarantee rather than a habit: if
 * anything below ever reaches for a request-time API, the export fails loudly.
 */
export const dynamic = 'error';

/**
 * Page metadata wins over the static fallback in `layout.tsx`, so the title,
 * description and share card follow `settings.seo` without a code edit.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await loadContent();
  const { seo, brand } = settings;
  const share = {
    url: brand.ogImage.src,
    width: brand.ogImage.width,
    height: brand.ogImage.height,
    alt: brand.ogImage.alt,
  };

  return {
    metadataBase: new URL(seo.siteUrl),
    title: seo.title,
    description: seo.description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: brand.name,
      url: '/',
      title: seo.title,
      description: seo.description,
      images: [share],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [share.url],
    },
  };
}

export default async function Page() {
  const content = await loadContent();

  return (
    <>
      <JsonLd content={content} />
      <PageView content={content} />
    </>
  );
}
