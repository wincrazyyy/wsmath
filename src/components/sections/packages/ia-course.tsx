import { PlateCta } from '@/components/ui/plate-cta';
import type { IaCourse } from '@/content/schema';

import './ia-course.css';

export interface IaCourseBlockProps {
  /** `content.iaCourse` — eyebrow, title, description, features, themes, ctaKey. */
  ia: IaCourse;
  /** `packagesPage.ctaLabel` — the same "Get in touch" every plate uses. */
  ctaLabel: string;
  /** `packagesPage.iaFootTag` — the small-caps tag beside the CTA. */
  footTag: string;
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** `whatsappPrefills[ia.ctaKey]`. */
  message: string;
}

/**
 * Row 4 of the packages section — the Maths IA instructional course
 * (artifact lines 1831–1865, CSS 1066–1078).
 *
 * An intro, then a two-column grid of the feature well beside the eight
 * amethyst champlevé theme chips, then the shared plate foot. The IA is a
 * course, not a plan, so its foot carries the WhatsApp plate and no
 * `PlanPick` — nothing here can reach the fixed "Your plan" panel.
 *
 * Every string comes from `ia-course.json` (read-only) or `packagesPage`; the
 * only text this file writes is the parentheses around a theme's description,
 * which are the card's typesetting — the JSON stores the sentence bare.
 */
export function IaCourseBlock({ ia, ctaLabel, footTag, phone, message }: IaCourseBlockProps) {
  return (
    <div className="mvt-ia">
      <div className="mvt-ia-intro">
        <p className="mvt-eyebrow mvt-rev mvt-rev--s">{ia.eyebrow}</p>
        <h3 className="mvt-h3 mvt-rev">{ia.title}</h3>
        {/* The artifact hand-wrapped only the closing figure sentence in
            `.mvt-num`. `ia-course.json` stores the description as ONE string,
            so reproducing that split would mean guessing a sentence boundary
            inside authored copy — the paragraph carries the class instead, and
            every figure in it (the 80+, the 2020–2025, the 1-to-1 ratio) gets
            the same tabular lining figures. Measured: no wrap point moves. */}
        <p className="mvt-body mvt-dim mvt-num mvt-rev mvt-rev--s">{ia.description}</p>
      </div>

      <div className="mvt-ia-grid">
        <div className="mvt-ia-feat mvt-well mvt-rev mvt-rev--s">
          <p className="mvt-mu mvt-brass">{ia.featuresLabel}</p>
          <ul>
            {ia.features.map((feature) => (
              <li key={feature.id}>
                <span className="mvt-li">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The themes list has no visible heading in this design, so its name
            comes from `themesLabel` — a real content field that would
            otherwise render nowhere. No visual change. */}
        <ul className="mvt-themes" aria-label={ia.themesLabel}>
          {ia.themes.map((theme) => (
            <li className="mvt-cham mvt-cham--am mvt-rev mvt-rev--s" key={theme.id}>
              <b>{theme.title}</b>
              <em>({theme.description})</em>
            </li>
          ))}
        </ul>
      </div>

      <div className="mvt-pack-foot mvt-rev mvt-rev--s">
        <span className="mvt-knurl" aria-hidden="true" />
        {/* no coin dot — the plate CTAs inside this section never carry one */}
        <PlateCta phone={phone} message={message} ctaKey={ia.ctaKey} label={ctaLabel} />
        <span className="mvt-mu mvt-dim">{footTag}</span>
      </div>
    </div>
  );
}
