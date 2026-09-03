'use client';

/**
 * The results tab panel — group tabs, the rising stream, the grade matrix and
 * the two read-outs.
 *
 * All the data arrives pre-computed from the server (`results-model.ts`), so
 * every group's ribbons and cells are in the prerendered HTML: this component
 * adds behaviour only.
 *
 * ## The draw-on (behaviours.md §5, artifact lines 2601–2665)
 *
 * The ribbons carry `vector-effect="non-scaling-stroke"`, which puts the dash
 * **pattern** in device pixels while the path's coordinates live in the
 * stretched 1000×620 user space. A dash length taken from `getTotalLength()`
 * (or from `pathLength`) therefore under-covers the on-screen path and the
 * pattern repeats — the v6.1 regression of two sliding segments instead of one
 * growing line. The length must be measured in device space: sample each path
 * at 24 equal arc-length steps, apply the svg's non-uniform viewBox scale to
 * each step, sum, and pad by 2px. The dash is cleared once the draw finishes so
 * a resize can never re-expose a stale device-space pattern.
 *
 * Reduced motion paints the stream complete on first paint and never animates.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { FolderTabs } from '@/components/ui/folder-tabs';

import { STREAM_VB_H, type MatrixCellModel, type ResultsGroupModel } from './results-model';

/** Copy for the interactive block, all from `pages.results`. */
export interface ResultsPanelCopy {
  readonly tabsLabel: string;
  /** Printed before each tab's record count — `n = `. Carries its own trailing space. */
  readonly tabsCountLabel: string;
  readonly stream: {
    readonly fromLabel: string;
    readonly toLabel: string;
    readonly readLabel: string;
    readonly readIdle: string;
    /** `{group} · n = {n} · {k} published records drawn` */
    readonly drawnTemplate: string;
  };
  readonly matrix: {
    readonly caption: string;
    readonly colLabel: string;
    /** Exactly four, in bin order. */
    readonly binLabels: readonly string[];
    readonly readoutLabel: string;
    readonly readoutIdle: string;
    /** The half of the prompt that talks about the stream — dropped where the stream is not drawn. */
    readonly readoutIdleStream: string;
    readonly note: string;
  };
}

export interface ResultsPanelProps {
  readonly groups: readonly ResultsGroupModel[];
  readonly copy: ResultsPanelCopy;
}

const NO_HIGHLIGHT: readonly number[] = [];

/** Draw timings, artifact lines 2649–2661. */
const DRAW_MS = 1600;
const STAGGER_MS = 40;
const WIDTH_MS = 160;
/** Samples per path when measuring device length. */
const SAMPLES = 24;

function cssVar(name: string, value: string): CSSProperties {
  return { [name]: value } as CSSProperties;
}

/** Abbreviated column label — the text before the first space (`0–1 grade improvement` → `0–1`). */
function abbreviate(binLabel: string): string {
  const at = binLabel.indexOf(' ');
  return at < 0 ? binLabel : binLabel.slice(0, at);
}

export function ResultsPanel({ groups, copy }: ResultsPanelProps) {
  const [active, setActive] = useState(groups[0]?.id ?? '');

  /* Two names, one shown at a time by media query — `display:none` is what
     keeps the hidden one out of the tab's accessible name as well as off the
     screen, so a phone tab is never announced as a duplicate of its neighbour
     (results.css, the ≤640 block). A single element cannot do this: the choice
     is a viewport question and the string has to be in the markup either way. */
  const items = groups.map((group) => ({
    id: group.id,
    label: (
      <>
        <b className="mvt-tab-wide">{group.headline}</b>
        <b className="mvt-tab-narrow">{group.tabLabel}</b>
        <span className="mvt-tab2">{group.detail}</span>
        <span className="mvt-tabn">
          {copy.tabsCountLabel}
          {group.totalCount}
        </span>
      </>
    ),
  }));

  const panels: Record<string, ReactNode> = {};
  for (const group of groups) {
    panels[group.id] = <GroupPanel group={group} copy={copy} active={group.id === active} />;
  }

  return (
    <FolderTabs
      items={items}
      panels={panels}
      ariaLabel={copy.tabsLabel}
      listClassName="mvt-res-tabs mvt-rev mvt-rev--s"
      tabClassName="mvt-res-tab"
      panelClassName="mvt-res-panel"
      onSelect={setActive}
      idPrefix="mvt-res"
    />
  );
}

interface GroupPanelProps {
  readonly group: ResultsGroupModel;
  readonly copy: ResultsPanelCopy;
  /** `true` while this group's tab is selected — a re-selection re-draws the stream. */
  readonly active: boolean;
}

function GroupPanel({ group, copy, active }: GroupPanelProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const visRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);
  const framesRef = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const seenRef = useRef(false);

  const [highlighted, setHighlighted] = useState<readonly number[]>(NO_HIGHLIGHT);
  const [streamRead, setStreamRead] = useState<string | null>(null);
  const [readout, setReadout] = useState<{ head: string; body: string } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const highlightSet = useMemo(() => new Set(highlighted), [highlighted]);

  const drawnLine = copy.stream.drawnTemplate
    .replace('{group}', group.name)
    .replace('{n}', String(group.totalCount))
    .replace('{k}', String(group.publishedCount));

  const cancelPending = useCallback(() => {
    for (const frame of framesRef.current) cancelAnimationFrame(frame);
    framesRef.current = [];
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** Paint every ribbon complete: no transition, no dash, zero offset. */
  const paintComplete = useCallback(() => {
    for (const path of [...visRefs.current, ...glowRefs.current]) {
      if (!path) continue;
      path.style.transition = 'none';
      path.style.strokeDasharray = 'none';
      path.style.strokeDashoffset = '0';
    }
  }, []);

  const draw = useCallback(
    (animate: boolean) => {
      const svg = svgRef.current;
      cancelPending();
      if (!svg || !animate || reducedRef.current) {
        paintComplete();
        return;
      }

      const box = svg.getBoundingClientRect();
      if (!box.width || !box.height) {
        paintComplete();
        return;
      }
      const viewBox = svg.viewBox.baseVal;
      const sx = viewBox.width ? box.width / viewBox.width : 1;
      const sy = viewBox.height ? box.height / viewBox.height : 1;

      const lengths: number[] = [];
      visRefs.current.forEach((path, index) => {
        if (!path) {
          lengths[index] = 0;
          return;
        }
        const length = deviceLength(path, sx, sy);
        lengths[index] = length;
        hide(path, length);
        hide(glowRefs.current[index], length);
      });

      // Two frames: the hidden state must be committed before the transition is
      // attached, or the browser coalesces both into "already at 0".
      const first = requestAnimationFrame(() => {
        const second = requestAnimationFrame(() => {
          visRefs.current.forEach((path, index) => {
            const delay = index * STAGGER_MS;
            if (path) {
              path.style.transition = `stroke-dashoffset ${DRAW_MS}ms var(--ease-draw) ${delay}ms, stroke-width ${WIDTH_MS}ms linear`;
              path.style.strokeDashoffset = '0';
            }
            const glow = glowRefs.current[index];
            if (glow) {
              glow.style.transition = `stroke-dashoffset ${DRAW_MS}ms var(--ease-draw) ${delay}ms, opacity ${WIDTH_MS}ms linear`;
              glow.style.strokeDashoffset = '0';
            }
          });
        });
        framesRef.current.push(second);
      });
      framesRef.current.push(first);

      timerRef.current = window.setTimeout(
        () => {
          for (const path of [...visRefs.current, ...glowRefs.current]) {
            if (path) path.style.strokeDasharray = 'none';
          }
        },
        DRAW_MS + visRefs.current.length * STAGGER_MS + WIDTH_MS,
      );
    },
    [cancelPending, paintComplete],
  );

  // First draw: the stream is already painted complete by the server markup; an
  // IntersectionObserver at 0.2 re-draws it as an engraving the first time it is
  // seen, then disconnects (artifact boot, lines 2964–2971). A panel that is
  // hidden behind another tab first intersects when its tab is selected, which
  // is exactly when its stream should draw.
  useEffect(() => {
    reducedRef.current =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedRef.current || typeof IntersectionObserver === 'undefined') {
      seenRef.current = true;
      paintComplete();
      return;
    }
    const svg = svgRef.current;
    if (!svg) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        seenRef.current = true;
        draw(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, [draw, paintComplete]);

  // Re-selecting a group that has already drawn re-draws it.
  useEffect(() => {
    if (active && seenRef.current) draw(true);
  }, [active, draw]);

  useEffect(() => cancelPending, [cancelPending]);

  const lightRecords = (cell: MatrixCellModel, on: boolean) => {
    setHighlighted(on ? cell.ribbonIndices : NO_HIGHLIGHT);
  };

  const readCell = (row: { gradeLabel: string }, cell: MatrixCellModel) => {
    setReadout({
      head: `${group.name} · ${copy.matrix.colLabel} ${row.gradeLabel} · ${copy.matrix.binLabels[cell.binIndex]}`,
      body: cell.records.join('  ·  '),
    });
  };

  const readoutId = `mvt-readout-${group.id}`;
  const captionId = `mvt-matrix-cap-${group.id}`;

  return (
    <>
      <div className="mvt-stream mvt-rev" aria-hidden="true">
        <div className="mvt-gut mvt-gut--l mvt-well">
          <span className="mvt-gut-cap mvt-mu">{copy.stream.fromLabel}</span>
          {group.gutters.map((tick) => (
            <span key={tick.label} className="mvt-gut-lab" style={cssVar('--p', String(tick.p))}>
              {tick.label}
            </span>
          ))}
        </div>

        <div className="mvt-stream-ch mvt-well">
          <svg
            ref={svgRef}
            className="mvt-stream-svg"
            viewBox={`0 0 1000 ${STREAM_VB_H}`}
            preserveAspectRatio="none"
            focusable="false"
          >
            <g>
              {group.ribbons.map((ribbon, index) => (
                <path
                  key={ribbon.key}
                  ref={(node) => {
                    glowRefs.current[index] = node;
                  }}
                  className={highlightSet.has(index) ? 'mvt-rib-glow is-hi' : 'mvt-rib-glow'}
                  d={ribbon.d}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
            <g>
              {group.ribbons.map((ribbon, index) => (
                <path
                  key={ribbon.key}
                  ref={(node) => {
                    visRefs.current[index] = node;
                  }}
                  className={highlightSet.has(index) ? 'mvt-rib is-hi' : 'mvt-rib'}
                  d={ribbon.d}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
            <g>
              {group.ribbons.map((ribbon, index) => (
                <path
                  key={ribbon.key}
                  className="mvt-rib-hit"
                  d={ribbon.d}
                  onPointerEnter={() => {
                    setHighlighted([index]);
                    setStreamRead(ribbon.label);
                  }}
                  onPointerLeave={() => {
                    setHighlighted(NO_HIGHLIGHT);
                    setStreamRead(null);
                  }}
                />
              ))}
            </g>
          </svg>
        </div>

        <div className="mvt-gut mvt-gut--r mvt-well">
          <span className="mvt-gut-cap mvt-mu">{copy.stream.toLabel}</span>
          {group.gutters.map((tick) => (
            <span key={tick.label} className="mvt-gut-lab" style={cssVar('--p', String(tick.p))}>
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mvt-stream-read mvt-well mvt-well--shallow mvt-rev mvt-rev--s" aria-live="polite">
        <p className="mvt-mu">{copy.stream.readLabel}</p>
        <p>{streamRead ?? drawnLine}</p>
      </div>

      <div className="mvt-matrix-well mvt-well mvt-rev">
        <table className="mvt-matrix" role="table" aria-labelledby={captionId}>
          <caption className="mvt-visually-hidden" id={captionId}>
            {copy.matrix.caption}
          </caption>
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" role="columnheader">
                {copy.matrix.colLabel}
              </th>
              {copy.matrix.binLabels.map((binLabel) => (
                <th key={binLabel} scope="col" role="columnheader">
                  <span className="mvt-th-ab" aria-hidden="true">
                    {abbreviate(binLabel)}
                  </span>
                  <span className="mvt-th-full">{binLabel}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {group.rows.map((row) => (
              <tr key={row.gradeIndex} role="row">
                <th scope="row" role="rowheader" className="mvt-num">
                  <span className="mvt-th-ab">{copy.matrix.colLabel} </span>
                  {row.gradeLabel}
                </th>
                {row.cells.map((cell) => {
                  const key = `${row.gradeIndex}-${cell.binIndex}`;
                  return (
                    <td key={key} className="mvt-cell" role="cell">
                      {cell.tier === null ? (
                        <span className="mvt-cellnil mvt-num">0</span>
                      ) : (
                        <button
                          type="button"
                          className={`mvt-cellbtn mvt-num mvt-${cell.tier}`}
                          aria-expanded={expanded === key}
                          aria-controls={readoutId}
                          aria-label={`${cell.count} in ${copy.matrix.binLabels[cell.binIndex]}, ${lowerFirst(copy.matrix.colLabel)} ${row.gradeLabel}`}
                          onPointerEnter={() => {
                            readCell(row, cell);
                            lightRecords(cell, true);
                          }}
                          onPointerLeave={() => lightRecords(cell, false)}
                          onFocus={() => {
                            readCell(row, cell);
                            lightRecords(cell, true);
                          }}
                          onBlur={() => lightRecords(cell, false)}
                          onClick={() => {
                            if (expanded === key) {
                              setExpanded(null);
                              setReadout(null);
                            } else {
                              setExpanded(key);
                              readCell(row, cell);
                            }
                          }}
                        >
                          {cell.count}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mvt-readout mvt-well mvt-well--shallow" id={readoutId} aria-live="polite">
          <p className="mvt-mu">{readout?.head ?? copy.matrix.readoutLabel}</p>
          {/* The idle prompt is two sentences with two different truth
              conditions. The second one points at the rising stream, which
              ≤640 does not draw (results.css) — printed there it tells a phone
              reader to look at something that is not on the page. Splitting it
              in content and hiding the span with the stream keeps the desktop
              sentence byte-identical and makes the phone one true. */}
          <p>
            {readout?.body ?? (
              <>
                {copy.matrix.readoutIdle}{' '}
                <span className="mvt-idle-stream">{copy.matrix.readoutIdleStream}</span>
              </>
            )}
          </p>
        </div>
        <p className="mvt-matrix-note mvt-small">{copy.matrix.note}</p>
      </div>
    </>
  );
}

/** `Final grade` → `final grade`, so the composed cell label reads as a sentence. */
function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function hide(path: SVGPathElement | null | undefined, length: number): void {
  if (!path) return;
  path.style.transition = 'none';
  path.style.strokeDasharray = String(length);
  path.style.strokeDashoffset = String(length);
}

/**
 * On-screen length of a path under a non-uniform viewBox scale: sample at
 * {@link SAMPLES} equal user-space arc-length steps, scale each step by the
 * svg's own `sx` / `sy`, and sum. `+2px` of rounding pad so the dash can never
 * fall short and leave a gap at the end of the draw.
 */
function deviceLength(path: SVGPathElement, sx: number, sy: number): number {
  if (typeof path.getTotalLength !== 'function') return 0;
  const total = path.getTotalLength();
  let previous = path.getPointAtLength(0);
  let sum = 0;
  for (let step = 1; step <= SAMPLES; step += 1) {
    const point = path.getPointAtLength((total * step) / SAMPLES);
    const dx = (point.x - previous.x) * sx;
    const dy = (point.y - previous.y) * sy;
    sum += Math.sqrt(dx * dx + dy * dy);
    previous = point;
  }
  return Math.ceil(sum) + 2;
}
