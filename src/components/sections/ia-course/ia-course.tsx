import { PlateCta } from '@/components/ui/plate-cta';
import type { IaCourse } from '@/content/schema';
import { sectionDomId } from '@/lib/anchors';

import './ia-course.css';

export interface IaCourseSectionProps {
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
 * The Maths IA instructional course (artifact lines 1977–2001, CSS 966–986),
 * a section of its own since 2026-09-28.
 *
 * It used to close the packages section, under the boards. Packages is now
 * headed "Group courses" and this course is 1-to-1 coaching, so it follows the
 * carmine private-coaching ribbon instead: group → 1-to-1 → 1-to-1 IA. It has
 * no nav marker of its own; `data-spy-part` makes the scroll-spy light
 * "Packages" across it, as across the ribbon, from either scroll direction.
 * Its title is an `<h2>` (at the `.mvt-h3` size,
 * like the ribbon's) — it heads a section now, not a block inside one.
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
export function IaCourseSection({ ia, ctaLabel, footTag, phone, message }: IaCourseSectionProps) {
  return (
    <section
      id="mvt-s-ia"
      className="mvt-sec"
      aria-labelledby="mvt-ia-title"
      data-spy-part={sectionDomId('packages')}
    >
      <div className="mvt-wrap mvt-ia">
        <div className="mvt-ia-grid">
          <div className="mvt-ia-intro">
            <p className="mvt-eyebrow mvt-rev mvt-rev--s">{ia.eyebrow}</p>
            <h2 id="mvt-ia-title" className="mvt-h3 mvt-rev">{ia.title}</h2>
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
          {/* no coin dot — artifact-faithful: the package plates never carried one */}
          <PlateCta phone={phone} message={message} ctaKey={ia.ctaKey} label={ctaLabel} />
          {footTag === undefined ? null : <span className="mvt-mu mvt-dim">{footTag}</span>}
        </div>
      </div>
    </section>
  );
}
