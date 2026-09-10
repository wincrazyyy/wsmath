import type { Faq, FaqPage, WhatsappPrefills } from '@/content/schema';
import { sectionDomId } from '@/lib/anchors';
import { paragraphs } from '@/lib/paragraphs';

import { FaqItem } from './faq-item';

import './faq.css';

export interface FaqSectionProps {
  /** `pages.faqPage`. */
  copy: FaqPage;
  /** `content.faqs` — the eight answers, byte-authoritative (\n\n is load-bearing). */
  faqs: readonly Faq[];
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** All prefills — `prefills[copy.ctaKey]` if the section renders a CTA. */
  prefills: WhatsappPrefills;
}

/**
 * ══ 10 · FAQ — eight engraved channels ══════════════════════════════════════
 *
 * Two columns of four. Eight full-width bars each ~70% empty is the "same
 * object repeated" failure; halving the measure and enlarging the question
 * fills the bar with the question and halves the section's vertical run. At
 * rest the two bars of a pair are levelled to the taller of them, so a
 * three-line question does not leave its neighbour short; the moment an answer
 * opens, the grid drops back to independent columns (faq.css), so opening a
 * question grows only its own column and never shunts the other four.
 *
 * `copy.sub` is optional in the schema and absent from the current copy: it
 * renders nothing when it is missing rather than being deleted outright, so a
 * line typed into the editor still appears. With no `.mvt-head-sub` child the
 * foundation collapses the head to a single track
 * (globals.css `:not(:has(.mvt-head-sub))`), which is the comp's composition.
 *
 * The answers are `faqs.json` verbatim, split on their blank lines by the
 * shared `paragraphs()` helper — the same one the privacy policy uses, so the
 * two renderings of "a blank line means a new paragraph" cannot drift. Two of
 * the eight are genuinely multi-paragraph (the Times Square line under "How do
 * lessons work?", and the trial-lesson answer's private/group split); that
 * `\n\n` is content, not formatting.
 *
 * The artifact renders no CTA here — the ribbon, packages, results and footer
 * already carry one, and a ninth brass plate under the last question would read
 * as a fifth ask. `copy.ctaKey` stays in the schema so the owner can turn one
 * on without a code change.
 */
export function FaqSection({ copy, faqs }: FaqSectionProps) {
  const ordered = faqs.toSorted((a, b) => a.order - b.order);

  return (
    <section id={sectionDomId('faq')} className="mvt-sec mvt-faqsec">
      <div className="mvt-wrap">
        <div className="mvt-head">
          <p className="mvt-eyebrow mvt-rev mvt-rev--s">{copy.eyebrow}</p>
          <h2 className="mvt-h2 mvt-rev">{copy.title}</h2>
          <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
          {copy.sub === undefined ? null : (
            <p className="mvt-head-sub mvt-lead mvt-rev mvt-rev--s">{copy.sub}</p>
          )}
        </div>
        <ul className="mvt-faq">
          {ordered.map((faq, index) => (
            <FaqItem
              key={faq.id}
              ordinal={String(index + 1).padStart(2, '0')}
              questionId={`mvt-q${index + 1}`}
              answerId={`mvt-a${index + 1}`}
              question={faq.question}
              body={paragraphs(faq.answer)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
