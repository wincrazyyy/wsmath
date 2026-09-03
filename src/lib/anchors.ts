/**
 * Section anchor mapping.
 *
 * Content stores design-agnostic section ids (`about`, `packages`, `#results`),
 * so a redesign never forces a content migration. The v6.3.2 DOM prefixes every
 * section id with `mvt-s-` (`<section id="mvt-s-about">`); these helpers are the
 * single place that prefix exists in code.
 *
 * Pure and isomorphic — safe to import from anything under `page-view.tsx`.
 */

/** `about` → `mvt-s-about`. The DOM id a section element must carry. */
export function sectionDomId(sectionId: string): string {
  return `mvt-s-${sectionId}`;
}

/**
 * `about` or `#about` → `#mvt-s-about`. The href an in-page link uses.
 * Already-prefixed values pass through unchanged.
 */
export function sectionHash(idOrHash: string): string {
  const id = idOrHash.startsWith("#") ? idOrHash.slice(1) : idOrHash;
  return id.startsWith("mvt-s-") ? `#${id}` : `#${sectionDomId(id)}`;
}
