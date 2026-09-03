/**
 * 8 · RESULTS — "Results, with context." (v6.3.2 "The Movement, Gilded")
 *
 * The original wsmath.com flow (head + context → outcome snapshot → group tabs
 * → grade improvements → schools), with v4.4's rising stream and v5.1's grade
 * matrix, struck in the gold ladder on the lacquer body. No coloured field;
 * carmine appears nowhere here.
 *
 * Artifact: markup lines 1878–2042, CSS 1080–1235, behaviour §4–§6.
 * Spec: `scratchpad/spec/sections/results.md`.
 *
 * Everything numeric is derived from the collections in `results-model.ts` —
 * the group sizes, every ribbon, every matrix cell and the four summary counts.
 * `students.json` is authoritative: the artifact's baked record arrays have
 * drifted from it.
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
  /** `content.students` — the 93 records; published ones feed stream + matrix. */
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
    stream: page.stream,
    matrix: {
      caption: page.matrix.caption,
      colLabel: page.matrix.colLabel,
      binLabels: page.matrix.binLabels.map((bin) => bin.text),
      readoutLabel: page.matrix.readoutLabel,
      readoutIdle: page.matrix.readoutIdle,
      readoutIdleStream: page.matrix.readoutIdleStream,
      note: page.matrix.note,
    },
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
          <linearGradient id="mvt-rib-grad-hi" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
            <stop offset="0" stopColor="#e0e8fd" stopOpacity="1" />
            <stop offset=".5" stopColor="#f0e6c0" stopOpacity="1" />
            <stop offset=".8" stopColor="#ffd83e" stopOpacity="1" />
            <stop offset="1" stopColor="#ffe97a" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mvt-wrap">
        <div className="mvt-res-head">
          <div className="mvt-head">
            <p className="mvt-eyebrow mvt-rev mvt-rev--s">{page.eyebrow}</p>
            <h2 className="mvt-h2 mvt-rev">{page.title}</h2>
            <span className="mvt-rule mvt-rev mvt-rev--rule" aria-hidden="true" />
            <p className="mvt-head-sub mvt-lead mvt-rev mvt-rev--s">{page.sub}</p>
          </div>
          <div className="mvt-res-uplift mvt-rev">
            <b className="mvt-num">{page.uplift.value}</b>
            <p className="mvt-mu">{page.uplift.note}</p>
            <p>{page.uplift.label}</p>
          </div>
        </div>

        <ul className="mvt-snaprail">
          {page.snapList.map((item) => (
            <li key={item.id} className="mvt-well mvt-rev mvt-rev--s">
              <span className="mvt-mu">{item.dt}</span>
              <b className="mvt-num">{item.dd}</b>
            </li>
          ))}
        </ul>

        <div className="mvt-grade-h">
          <h3 className="mvt-h3 mvt-rev">{page.gradeHead.title}</h3>
          <p className="mvt-body mvt-dim mvt-rev mvt-rev--s">{page.gradeHead.sub}</p>
          <p className="mvt-body mvt-rev mvt-rev--s">
            <span className="mvt-num">{page.gradeHead.scaleLeft}</span>{' '}
            <span aria-hidden="true">·</span>{' '}
            <span className="mvt-num mvt-dim">{page.gradeHead.scaleRight}</span>
          </p>
        </div>

        <ResultsPanel groups={model.groups} copy={panelCopy} />

        {/* summary counts — GLOBAL over the published records, counted from
            students.json, never typed into copy */}
        <ul className="mvt-legend">
          {page.legend.map((card) => {
            const count = model.legend[card.metric];
            return (
              <li key={card.id} className="mvt-well mvt-rev mvt-rev--s">
                <span aria-hidden="true">{card.emoji}</span>
                <span className="mvt-li">{card.label}</span>
                <span className="mvt-legend-n">
                  <b className="mvt-num">{count?.count ?? 0}</b>
                  <span className="mvt-legend-p mvt-num">{count?.percent ?? '0%'}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mvt-legend-scope mvt-small mvt-rev mvt-rev--s">{page.legendScope}</p>

        <ul className="mvt-reschips">
          {page.chips.map((chip) => (
            <li key={chip.id} className="mvt-rev mvt-rev--s">
              {chip.text}
            </li>
          ))}
        </ul>

        <div className="mvt-schools-h">
          <p className="mvt-eyebrow mvt-rev mvt-rev--s">{page.schoolsHead.eyebrow}</p>
          <h3 className="mvt-h3 mvt-rev">{page.schoolsHead.title}</h3>
          <p className="mvt-body mvt-dim mvt-rev mvt-rev--s">{page.schoolsHead.prov}</p>
        </div>
        <ul className="mvt-schools mvt-well mvt-rev">
          {schools.map((school) => (
            <li key={school.id}>{school.name}</li>
          ))}
        </ul>

        <div className="mvt-rescta mvt-raise mvt-rev">
          <div className="mvt-rescta-copy">
            <h3 className="mvt-h3">{page.cta.title}</h3>
            <p className="mvt-body">{page.cta.body}</p>
            <ul>
              {page.cta.rows.map((row) => (
                <li key={row.id}>
                  <span className="mvt-li mvt-num">{row.text}</span>
                </li>
              ))}
            </ul>
            <p className="mvt-small mvt-dim">{page.cta.prov}</p>
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
