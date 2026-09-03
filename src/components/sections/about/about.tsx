import Image from 'next/image';
import { Fragment } from 'react';

import type { About as AboutCopy, JourneyItem, LeadItem } from '@/content/schema';
import { sectionDomId } from '@/lib/anchors';

import './about.css';

export interface AboutProps {
  /** `pages.about`. */
  about: AboutCopy;
}

/** A grade that reads as a number gets the lining/tabular figure set; `A*`, `F` do not. */
function isNumericGrade(value: string): boolean {
  return /^\d+(\.\d+)?$/.test(value);
}

/**
 * `IGCSE 0606` → `IGCSE ` + a tabular `0606`; `IBDP AAHL` → the label alone.
 * The exam-board syllabus numbers in a course label are figures, not words, and
 * the artifact sets them in the numeral register so 0606/0607/0580 line up.
 * `lead` keeps its trailing space: the grade that follows is a sibling node.
 */
function courseParts(course: string): { readonly lead: string; readonly code: string | null } {
  const match = /^(.*)\s(\d+)$/.exec(course);
  if (match === null) return { lead: `${course} `, code: null };
  return { lead: `${match[1]} `, code: match[2] };
}

/** One ruled line on a paper sheet: the bold lead and its sentence read as one line. */
function paperLine(item: LeadItem): string {
  return item.lead === undefined ? item.text : `${item.lead} ${item.text}`;
}

/** One ivory past-paper sheet, inlaid into a 10px well tray. */
function PaperSheet({ title, items }: { title: string; items: readonly LeadItem[] }) {
  return (
    <div className="mvt-inlay mvt-well mvt-rev mvt-rev--paper">
      <div className="mvt-paper">
        <h3 className="mvt-mu">{title}</h3>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <span className="mvt-li">{paperLine(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * One result pill: `Name (year) COURSE from → to` on the left, the duration
 * right-justified by the flex gap. The outcome is ALWAYS struck in `--au-lit`
 * — it is the only gold in this section.
 */
function JourneyPill({ item }: { item: JourneyItem }) {
  const { lead, code } = courseParts(item.course);
  return (
    <li className="mvt-well mvt-well--shallow mvt-rev mvt-rev--s">
      <b>
        {item.name} <span>({item.year})</span> {lead}
        {code === null ? null : (
          <>
            <span className="mvt-num">{code}</span>{' '}
          </>
        )}
        {isNumericGrade(item.from) ? <span className="mvt-num">{item.from}</span> : item.from}{' '}
        <span className="mvt-arrow">→</span>{' '}
        <span className={isNumericGrade(item.to) ? 'mvt-aulit mvt-num' : 'mvt-aulit'}>{item.to}</span>
      </b>{' '}
      <span>({item.duration})</span>
    </li>
  );
}

/**
 * ABOUT — "Premium Exam Coaching".
 *
 * A 60/40 grid: the section head and the two ivory paper sheets run down the
 * left column; a raised photo plate and the "Who I teach" well stack in the
 * right. The seven result pills run full-width beneath, on a count-aware
 * 12-column ledger grid whose spans always sum to 12 so no record count can
 * strand an orphan pill.
 */
export function About({ about }: AboutProps) {
  return (
    <section id={sectionDomId('about')} className="mvt-sec">
      <div className="mvt-wrap">
        <div className="mvt-about-grid">
          <div className="mvt-about-main">
            <div className="mvt-about-head">
              <p className="mvt-eyebrow mvt-rev mvt-rev--s">{about.eyebrow}</p>
              <span className="mvt-hair mvt-rev mvt-rev--rule" aria-hidden="true" />
              <h2 className="mvt-h2 mvt-rev">{about.title}</h2>
              <p className="mvt-lead mvt-rev mvt-rev--s">{about.lede}</p>
            </div>
            <div className="mvt-about-papers">
              <PaperSheet title={about.whatYouGet.title} items={about.whatYouGet.items} />
              <PaperSheet title={about.howITeach.title} items={about.howITeach.items} />
            </div>
          </div>

          <div className="mvt-about-side">
            <div className="mvt-photo mvt-raise mvt-rev">
              <figure>
                <Image src={about.figure.src} alt={about.figure.alt} fill sizes="(max-width:1024px) 100vw, 40vw" />
              </figure>
            </div>
            <div className="mvt-who mvt-well mvt-well--shallow mvt-rev mvt-rev--s">
              <p className="mvt-mu">{about.whoBlock.label}</p>
              <div className="mvt-who-row">
                <b>{about.whoBlock.ageLead}</b>
                <span>{about.whoBlock.ageRest}</span>
              </div>
              {/* dt/dd are grid items of the <dl> itself — a wrapper element (even
                  `display:contents`) changes how the row baselines resolve, so the
                  rows are keyed Fragments and the DOM stays the artifact's. */}
              <dl>
                {about.whoBlock.rows.map((row) => (
                  <Fragment key={row.id}>
                    <dt>{row.dt}</dt>
                    <dd>
                      <span className="mvt-code">{row.dd}</span>
                    </dd>
                  </Fragment>
                ))}
              </dl>
              <div className="mvt-chipwrap">
                <span className="mvt-chip mvt-small">{about.whoBlock.chip}</span>
              </div>
            </div>
          </div>
        </div>

        <ul className="mvt-pills">
          {about.journeys.items.map((item) => (
            <JourneyPill key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}
