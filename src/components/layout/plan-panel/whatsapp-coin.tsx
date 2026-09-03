'use client';

import { WhatsAppIcon } from '@/components/ui/icons';
import { waHref } from '@/components/ui/plate-cta';
import { sendCtaBeacon } from '@/lib/cta-beacon';

import { usePlan } from './plan-context';
import './plan-panel.css';

export interface WhatsAppCoinProps {
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** The coin's prefill — the artifact uses the nav message. */
  message: string;
  /** Beacon id for the coin's clicks (the artifact pairs it with `nav`). */
  ctaKey: string;
  /** Accessible name, from content (`pages.nav.ctaLabel`). */
  ariaLabel: string;
}

/**
 * `.mvt-coin` — the fixed WhatsApp FAB, bottom-right. While the "Your plan"
 * panel is visible the coin yields its corner: it cross-fades out (never
 * `display:none` mid-transition), leaves the tab order and the accessibility
 * tree, and returns ~120ms after the panel parks or hides (the delay lives in
 * `plan-panel.css`). The panel's own WhatsApp CTA covers the coin's function
 * while it is hidden, so no conversion path is lost.
 */
export function WhatsAppCoin({ phone, message, ctaKey, ariaLabel }: WhatsAppCoinProps) {
  const { live } = usePlan();
  return (
    <a
      className={live ? 'mvt-coin is-hidden' : 'mvt-coin'}
      href={waHref(phone, message)}
      target="_blank"
      rel="noopener"
      aria-label={ariaLabel}
      aria-hidden={live || undefined}
      tabIndex={live ? -1 : undefined}
      data-cta={ctaKey}
      onClick={() => sendCtaBeacon(ctaKey)}
    >
      <span>
        <WhatsAppIcon />
      </span>
    </a>
  );
}
