import { unitFromPer } from '@/components/layout/plan-panel/plan-options';
import { PlateCta } from '@/components/ui/plate-cta';
import { noBreakRatios } from '@/components/ui/typeset';
import type { Package, Ribbon as RibbonCopy } from '@/content/schema';
import { sectionDomId } from '@/lib/anchors';

import './ribbon.css';

export interface RibbonProps {
  /** `pages.ribbon`. */
  ribbon: RibbonCopy;
  /**
   * The private package (`kind: "private"`), whose name and prices the band
   * prints. Absent, the band is the bare availability strike it used to be.
   */
  offer: Package | undefined;
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** `whatsappPrefills[ribbon.ctaKey]`, resolved at the page boundary. */
  message: string;
}

/**
 * The carmine band — the page's ONE material change (artifact lines 1681–1699),
 * and since 2026-09-28 the private-coaching offer as well. The band used to sit
 * between About and Packages saying "limited 1-to-1 availability" while a
 * separate private plate at the foot of Packages sold the same thing; the two
 * are one unit now, closing Packages, so the premium path reads after the
 * group courses and scarcity is stated beside the price it qualifies.
 *
 * Left: the offer's name, the availability line, the rule. Right, in the
 * deeper carmine well: the hourly rate, the block price when the package has
 * one (the current copy does not), and the one WhatsApp plate. The figures come
 * from the private package, not from here, so no second copy of a price exists
 * to drift.
 *
 * `body` and `waLabel` are optional: each is rendered only when it exists —
 * never as an empty element the flex gaps would still pay for.
 *
 * The `.mvt-edge` seams above and below are rendered by `page-view.tsx`, not
 * here. The heading is an `<h2>` at the `.mvt-h3` size — the band is a
 * statement, not a section with a header pattern, so it keeps the document
 * hierarchy without claiming a section heading's weight.
 */
export function Ribbon({ ribbon, offer, phone, message }: RibbonProps) {
  const rate = offer?.price;
  const block = offer?.blockPrice;
  return (
    <section
      id="mvt-s-ribbon"
      className="mvt-ribbon"
      aria-label={ribbon.ariaLabel}
      data-spy-part={sectionDomId('packages')}
    >
      <div className="mvt-wrap">
        <div className="mvt-ribbon-in">
          <div className="mvt-ribbon-copy">
            {offer === undefined ? null : (
              <p className="mvt-mu mvt-ribbon-name mvt-rev mvt-rev--s">{noBreakRatios(offer.title)}</p>
            )}
            <h2 className="mvt-h3 mvt-rev">{noBreakRatios(ribbon.title)}</h2>
            <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
            {ribbon.body === undefined ? null : <p className="mvt-body mvt-rev mvt-rev--s">{ribbon.body}</p>}
          </div>

          <div className="mvt-ribbon-cta mvt-well mvt-well--ca mvt-rev mvt-rev--s">
            {rate === undefined && block === undefined ? null : (
              <dl className="mvt-ribbon-rates">
                {rate === undefined ? null : (
                  <div>
                    <dt className="mvt-mu">{ribbon.rateLabel}</dt>
                    <dd>
                      <b className="mvt-num">{rate.now}</b>
                      <span className="mvt-num">{unitFromPer(rate.per)}</span>
                    </dd>
                  </div>
                )}
                {block === undefined ? null : (
                  <div>
                    <dt className="mvt-mu">{block.label}</dt>
                    <dd>
                      <b className="mvt-num">{block.now}</b>
                      {block.per === undefined ? null : <span className="mvt-num">{block.per}</span>}
                    </dd>
                  </div>
                )}
              </dl>
            )}
            {ribbon.waLabel === undefined ? null : <p className="mvt-mu">{ribbon.waLabel}</p>}
            <PlateCta phone={phone} message={message} ctaKey={ribbon.ctaKey} label={ribbon.ctaLabel} dot />
          </div>
        </div>
      </div>
    </section>
  );
}
