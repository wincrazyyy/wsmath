'use client';

import { sendCtaBeacon } from '@/lib/cta-beacon';
import { WhatsAppIcon } from './icons';

/**
 * Build the `wa.me` deep link for a prefilled message.
 *
 * `encodeURIComponent` leaves `'`, `(` and `)` untouched, which reproduces the
 * artifact's href encoding exactly. Never hand-assemble a `wa.me` URL — the
 * phone and the message are both tokens (`settings.contact.whatsappPhone`,
 * `whatsapp-prefills.json`).
 */
export function waHref(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface PlateCtaProps {
  /** Digits only, no `+` — e.g. `'85269447214'`. */
  phone: string;
  /** The prefilled message, already token-interpolated (from `whatsappPrefills[ctaKey]`). */
  message: string;
  /**
   * Canonical CTA id. It is simultaneously the prefill key, the `data-cta`
   * attribute and the beacon id — one identifier, three uses, so analytics can
   * never drift from copy. Never a string literal in JSX: pass the `ctaKey`
   * from content.
   */
  ctaKey: string;
  /** Visible label, from content (e.g. `Get in touch`). */
  label: string;
  /**
   * Render the lac-void disc with the WhatsApp glyph before the label. The
   * artifact shows it on the hero, ribbon, results, footer and plan-panel CTAs,
   * and omits it in the nav and on the package plates.
   */
  dot?: boolean;
  /** Extra classes after `mvt-plate-cta`. */
  className?: string;
  /** Accessible name beyond the visible label, from content. Rarely needed. */
  ariaLabel?: string;
}

/**
 * The brass plate CTA — `.mvt-plate-cta`, the design's only WhatsApp button
 * shape. Styling lives in `globals.css` (shared vocabulary); size overrides
 * (`min-height`, padding) belong to the consuming section's stylesheet.
 *
 * Every WhatsApp CTA on the site goes through this component (or `WaTextLink`)
 * so no conversion is ever un-instrumented.
 */
export function PlateCta({ phone, message, ctaKey, label, dot = false, className, ariaLabel }: PlateCtaProps) {
  return (
    <a
      className={className ? `mvt-plate-cta ${className}` : 'mvt-plate-cta'}
      href={waHref(phone, message)}
      target="_blank"
      rel="noopener"
      data-cta={ctaKey}
      aria-label={ariaLabel}
      onClick={() => sendCtaBeacon(ctaKey)}
    >
      {dot ? (
        <span className="mvt-coin-dot" aria-hidden="true">
          <WhatsAppIcon />
        </span>
      ) : null}
      {label}
    </a>
  );
}

export interface WaTextLinkProps {
  phone: string;
  message: string;
  ctaKey: string;
  /** Visible label, from content. */
  label: string;
  /** Classes on the `<a>`. */
  className?: string;
}

/**
 * A plain text link that opens WhatsApp — used where a link list carries a
 * `kind: "whatsapp"` entry (the footer's Contact link). Same href construction
 * and same beacon as {@link PlateCta}.
 */
export function WaTextLink({ phone, message, ctaKey, label, className }: WaTextLinkProps) {
  return (
    <a
      className={className}
      href={waHref(phone, message)}
      target="_blank"
      rel="noopener"
      data-cta={ctaKey}
      onClick={() => sendCtaBeacon(ctaKey)}
    >
      {label}
    </a>
  );
}
