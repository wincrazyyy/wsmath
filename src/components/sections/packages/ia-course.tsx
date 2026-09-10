import { PlateCta } from '@/components/ui/plate-cta';
import type { IaCourse } from '@/content/schema';

import './ia-course.css';

export interface IaCourseBlockProps {
  /** `content.iaCourse` — eyebrow, title, description, themes, ctaKey. */
  ia: IaCourse;
  /** The button label, already resolved: `iaCourse.ctaLabel ?? packagesPage.ctaLabel`. */
  ctaLabel: string;
  /** `packagesPage.iaFootTag` — the small-caps tag beside the CTA, when one is authored. */
  footTag: string | undefined;
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** `whatsappPrefills[ia.ctaKey]`. */
  message: string;
}

/**
 * The Maths IA instructional course, at the foot of the packages section
 * (artifact lines 1977–2001, CSS 966–986).
 *
 * The intro sits beside the eight amethyst champlevé theme chips in one 38/62
 * grid, with the shared plate foot under both. The IA is a course, not a plan,
 * so its foot carries the WhatsApp plate and no `PlanPick` — nothing here can
 * reach the fixed "Your plan" panel.
 *
 * Every string comes from `ia-course.json` (read-only) or `packagesPage`. The
 * feature well this block used to carry is gone with `features` /
 * `featuresLabel`, which are now optional and unauthored: the themes are the
 * argument, and a second list beside them was repeating it.
 */
export function IaCourseBlock({ ia, ctaLabel, footTag, phone, message }: IaCourseBlockProps) {
  return (
    <div className="mvt-ia">
      <div className="mvt-ia-grid">
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

        {/* The themes list has no visible heading in this design, so its name
            comes from `themesLabel` — a real content field that would
            otherwise render nowhere. No visual change. */}
        <ul className="mvt-themes" aria-label={ia.themesLabel}>
          {ia.themes.map((theme) => (
            <li className="mvt-cham mvt-cham--am mvt-rev mvt-rev--s" key={theme.id}>
              <b>{theme.title}</b>
              {/* `description` is optional and unauthored in this cut — a chip
                  is its title alone. The parentheses around a description are
                  this card's typesetting; the JSON stores the sentence bare. */}
              {theme.description === undefined ? null : <em>({theme.description})</em>}
            </li>
          ))}
        </ul>
      </div>

      <div className="mvt-pack-foot mvt-rev mvt-rev--s">
        <span className="mvt-knurl" aria-hidden="true" />
        {/* no coin dot — the plate CTAs inside this section never carry one */}
        <PlateCta phone={phone} message={message} ctaKey={ia.ctaKey} label={ctaLabel} />
        {footTag === undefined ? null : <span className="mvt-mu mvt-dim">{footTag}</span>}
      </div>
    </div>
  );
}
