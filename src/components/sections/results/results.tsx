/**
 * 8 · RESULTS — "Results, with context." (v6.3.2 "The Movement, Gilded")
 *
 * The original wsmath.com flow (head + outcome snapshot → group tabs → the
 * rising stream → schools), struck in the gold ladder on the lacquer body. No
 * coloured field; carmine appears nowhere here.
 *
 * The stream is the section's ONE visual: the snap rail, the label chips and
 * the grade matrix are gone, and the three summary counts under the stream are
 * its caption — counted for the selected group, not globally.
 *
 * Artifact: `scratchpad/build/improved.html`, markup at `id="mvt-s-results"`,
 * CSS at `.mvt-results`.
 *
 * Everything numeric is derived from the collections in `results-model.ts` —
 * the group sizes, every ribbon and every summary count. `students.json` is
 * authoritative: the artifact's baked record arrays have drifted from it.
 */

import Image from 'next/image';

import { PlateCta } from '@/components/ui/plate-cta';
import type {
  GradeScale,
  Programme,
  Results as ResultsCopy,
  School,
  Student,
  WhatsappPrefills,
} from '@/content/schema';

import { buildResultsModel } from './results-model';
import { ResultsPanel, type ResultsPanelCopy } from './results-panel';

import './results.css';

export interface ResultsSectionProps {
  /** `pages.results`. */
  page: ResultsCopy;
  /** `content.programmes` — the six group tabs, ordered by `order`. */
  programmes: readonly Programme[];
  /** `content.students` — the 93 records; published ones feed the stream. */
  students: readonly Student[];
  /** `content.gradeScales` — the rails. */
  gradeScales: readonly GradeScale[];
  /** `content.schools` — the 30-name well, in order. */
  schools: readonly School[];
  /** `settings.contact.whatsappPhone`. */
  phone: string;
  /** All prefills — the closing CTA uses `prefills[page.cta.ctaKey]`. */
  prefills: WhatsappPrefills;
}

export function ResultsSection({
  page,
  programmes,
  students,
  gradeScales,
  schools,
  phone,
  prefills,
}: ResultsSectionProps) {
  const model = buildResultsModel(programmes, students, gradeScales);

  const panelCopy: ResultsPanelCopy = {
    tabsLabel: page.tabsLabel,
    tabsCountLabel: page.tabsCountLabel,
    stream: { fromLabel: page.stream.fromLabel, toLabel: page.stream.toLabel },
    legend: page.legend,
    legendScope: page.legendScope,
  };

  return (
    <section id="mvt-s-results" className="mvt-sec mvt-results">
      {/* SILVER INTO GOLD — the ribbon is the record's temperature: cool platinum
          starlight at the predicted grade, warming through champagne, igniting
          into outcome gold at the final grade. Declared once for every group's
          stream; a wide low-opacity glow under each ribbon makes the stream read
          as streaks of light. */}
      <svg className="mvt-res-defs" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="mvt-rib-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
            <stop offset="0" stopColor="#aebadf" stopOpacity=".55" />
            <stop offset=".45" stopColor="#c9d3ec" stopOpacity=".62" />
            <stop offset=".68" stopColor="#e6d9a6" stopOpacity=".78" />
            <stop offset=".85" stopColor="#fad035" stopOpacity=".95" />
            <stop offset="1" stopColor="#ffe066" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mvt-wrap">
        <div className="mvt-head">
          <p className="mvt-eyebrow mvt-rev mvt-rev--s">{page.eyebrow}</p>
          <h2 className="mvt-h2 mvt-rev">{page.title}</h2>
          {/* the outcome snapshot IS the head's sub-column: it takes the
              `.mvt-head-sub` slot beside the heading rather than a second
              two-column wrapper of its own */}
          <div className="mvt-head-sub mvt-res-uplift mvt-rev">
            <b className="mvt-num">{page.uplift.value}</b>
            <p>{page.uplift.label}</p>
          </div>
          <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
        </div>

        <div className="mvt-grade-h">
          <h3 className="mvt-h3 mvt-rev">{page.gradeHead.title}</h3>
          {page.gradeHead.sub !== undefined && (
            <p className="mvt-body mvt-dim mvt-rev mvt-rev--s">{page.gradeHead.sub}</p>
          )}
          <p className="mvt-body mvt-rev mvt-rev--s">
            <span className="mvt-num">{page.gradeHead.scaleLeft}</span>{' '}
            <span aria-hidden="true">·</span>{' '}
            <span className="mvt-num mvt-dim">{page.gradeHead.scaleRight}</span>
          </p>
        </div>

        {/* the tabs, the stream and the stream's caption — the legend is counted
            per group, so it lives with the panel that owns the selection */}
        <ResultsPanel groups={model.groups} copy={panelCopy} />

        <div className="mvt-schools-h">
          <p className="mvt-eyebrow mvt-rev mvt-rev--s">{page.schoolsHead.eyebrow}</p>
          <h3 className="mvt-h3 mvt-rev">{page.schoolsHead.title}</h3>
        </div>
        <ul className="mvt-schools mvt-well mvt-rev">
          {schools.map((school) => (
            <li key={school.id}>{school.name}</li>
          ))}
        </ul>

        <div className="mvt-rescta mvt-raise mvt-rev">
          <div className="mvt-rescta-copy">
            <h3 className="mvt-h3">{page.cta.title}</h3>
            <ul>
              {page.cta.rows.map((row) => (
                <li key={row.id}>
                  <span className="mvt-li mvt-num">{row.text}</span>
                </li>
              ))}
            </ul>
            <div className="mvt-rescta-foot">
              <span className="mvt-knurl" aria-hidden="true" />
              <PlateCta
                phone={phone}
                message={prefills[page.cta.ctaKey]}
                ctaKey={page.cta.ctaKey}
                label={page.cta.ctaLabel}
                dot
              />
              <span className="mvt-mu mvt-trio">{page.cta.trio}</span>
            </div>
          </div>
          <div className="mvt-rescta-img mvt-well mvt-well--shallow">
            <Image
              src={page.cta.art.src}
              alt={page.cta.art.alt}
              width={page.cta.art.width}
              height={page.cta.art.height}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
