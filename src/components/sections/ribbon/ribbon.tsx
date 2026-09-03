import { PlateCta } from '@/components/ui/plate-cta';
import type { Ribbon as RibbonCopy } from '@/content/schema';

import './ribbon.css';

export interface RibbonProps {
  /** `pages.ribbon`. */
  ribbon: RibbonCopy;
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** `whatsappPrefills[ribbon.ctaKey]`, resolved at the page boundary. */
  message: string;
}

/**
 * The carmine access ribbon — the page's ONE material change (artifact lines
 * 1681–1699). A full-bleed band in `--ca-deep` stating limited availability,
 * with a deeper carmine well holding the WhatsApp plate on the right.
 *
 * The `.mvt-edge` seams above and below are rendered by `page-view.tsx`, not
 * here. The heading is an `<h2>` at the `.mvt-h3` size — the ribbon is a
 * statement, not a section with a header pattern, so it keeps the document
 * hierarchy without claiming a section heading's weight.
 */
export function Ribbon({ ribbon, phone, message }: RibbonProps) {
  return (
    <section id="mvt-s-ribbon" className="mvt-ribbon" aria-label={ribbon.ariaLabel}>
      <div className="mvt-wrap">
        <div className="mvt-ribbon-in">
          <div className="mvt-ribbon-copy">
            <h2 className="mvt-h3 mvt-rev">{ribbon.title}</h2>
            <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
            <p className="mvt-body mvt-rev mvt-rev--s">{ribbon.body}</p>
          </div>

          <div className="mvt-ribbon-cta mvt-well mvt-well--ca mvt-rev mvt-rev--s">
            <p className="mvt-mu">{ribbon.waLabel}</p>
            <PlateCta phone={phone} message={message} ctaKey={ribbon.ctaKey} label={ribbon.ctaLabel} dot />
          </div>
        </div>
      </div>
    </section>
  );
}
