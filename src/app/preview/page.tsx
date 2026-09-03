import type { Metadata } from 'next';

import { loadContent } from '@/lib/content';

import { PreviewClient } from './preview-client';

/**
 * `/preview` — the third part of the editor contract (§3.3).
 *
 * The editor loads this route in an iframe beside its editing form and posts a
 * draft content set in as the client types. The page renders the **real**
 * components with the **real** CSS, so what a client approves cannot drift from
 * what deploys.
 *
 * This server half exists only to give the client half a valid starting point:
 * the published content, parsed and token-resolved exactly as `/` does it. From
 * there every update arrives over `postMessage`.
 */
export const dynamic = 'error';

export const metadata: Metadata = {
  title: 'Preview',
  /* A near-duplicate of the home page. Kept out of the index here rather than
     with a `Disallow`, which would also stop a crawler reading this. */
  robots: { index: false, follow: false },
};

export default async function PreviewPage() {
  const content = await loadContent();

  return <PreviewClient initial={content} />;
}
