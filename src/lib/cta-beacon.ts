/**
 * CTA instrumentation.
 *
 * WhatsApp deep links are the only conversion mechanism on this site, so every
 * `wa.me` click is reported to a collector endpoint. The transport is
 * `navigator.sendBeacon` so the request survives the navigation the click
 * causes; `fetch(…, { keepalive: true })` is the fallback for browsers without
 * it.
 *
 * This module is instrumentation, not a feature: it must never throw, never
 * block the click, and must no-op silently in production when
 * `NEXT_PUBLIC_CTA_ENDPOINT` is unset (which is the case on any preview build).
 */

/** Canonical CTA ids used across the page. Kept as documentation, not a type
 *  constraint — the schema, not the code, decides which CTAs exist. The order
 *  matches `CTA_KEYS` in `src/content/schema/media.ts` exactly: the two lists
 *  describe the same set from two sides, and drift between them is silent in
 *  the type-checker and loud in the analytics. */
export const CTA_IDS = [
  'nav',
  'about-ribbon',
  'results',
  'private',
  'ibdp',
  'ial',
  'igcse',
  'ia',
  'video',
  'faq',
  'footer',
] as const;

export type CtaId = (typeof CTA_IDS)[number];

export interface CtaBeaconPayload {
  /** Always `'wsmath'` — the collector is shared across client sites. */
  site: 'wsmath';
  /** The CTA identifier, e.g. `'nav'` or `'about-ribbon'`. */
  cta: string;
  /** Path + query of the page the click happened on. */
  path: string;
  /** `document.referrer`, empty string when there is none. */
  referrer: string;
  /** Epoch milliseconds at click time. */
  ts: number;
}

function report(error: unknown): void {
  // Never surface a telemetry failure to the visitor, but never swallow it in
  // development either — a broken collector should be visible while building.
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[cta-beacon] delivery failed', error);
  }
}

/**
 * Fire-and-forget a CTA click.
 *
 * @param cta - Canonical CTA id (see {@link CTA_IDS}).
 *
 * No-ops when: called on the server, `NEXT_PUBLIC_CTA_ENDPOINT` is unset, or no
 * transport is available. Never throws.
 */
export function sendCtaBeacon(cta: string): void {
  const endpoint = process.env.NEXT_PUBLIC_CTA_ENDPOINT;
  if (!endpoint) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const payload: CtaBeaconPayload = {
      site: 'wsmath',
      cta,
      path: `${window.location.pathname}${window.location.search}`,
      referrer: document.referrer,
      ts: Date.now(),
    };
    const body = JSON.stringify(payload);

    const beacon = window.navigator?.sendBeacon;
    if (typeof beacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      // `sendBeacon` returns false when the user agent refuses to queue it.
      if (window.navigator.sendBeacon(endpoint, blob)) return;
    }

    if (typeof fetch === 'function') {
      void fetch(endpoint, {
        method: 'POST',
        body,
        keepalive: true,
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
      }).catch(report);
    }
  } catch (error) {
    report(error);
  }
}
