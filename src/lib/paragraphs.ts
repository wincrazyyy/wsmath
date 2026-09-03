/**
 * Paragraph splitting for long-form content bodies.
 *
 * Shared so the privacy policy's two renderings — the Radix dialog and the
 * scripts-off fallback printed into the footer (`PrivacyStatic`, hidden by the
 * `body.js` gate in `footer.css`) — cannot drift apart. The FAQ answers and the
 * policy sections both rely on a blank line meaning "new paragraph"; that
 * `\n\n` is load-bearing content (`CLAUDE.md` §1) and is preserved verbatim in
 * the JSON rather than being re-authored as an array.
 */

/** A blank line starts a new paragraph. Empty parts are dropped. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
