'use client';

/**
 * The results tab panel — the group tabs, the rising stream and the stream's
 * caption: the three summary counts for the SELECTED group.
 *
 * All the data arrives pre-computed from the server (`results-model.ts`), so
 * every group's ribbons and counts are in the prerendered HTML: this component
 * adds behaviour only.
 *
 * The legend lives inside the tab panel, not beside it. It counts the records
 * the stream above it draws, so it is content the tab controls: rendering it
 * outside the panel would leave a screen-reader user inside the panel without
 * it, and change it silently when the tab moves.
 *
 * ## The draw-on (behaviours.md §5, artifact lines 2601–2665)
 *
 * The ribbons carry `vector-effect="non-scaling-stroke"`, which lays the dash
 * **pattern** out in the host space — the svg's own layout box in CSS px,
 * before the root's `zoom` and any ancestor transform — while the path's
 * coordinates live in the stretched 1000×620 user space. A dash length taken
 * from `getTotalLength()` (or from `pathLength`) therefore under-covers the
 * drawn path and the pattern repeats — the v6.1 regression of two sliding
 * segments instead of one growing line. So does a length taken from
 * `getBoundingClientRect()`, which is the ZOOMED box: under the desktop `.85`
 * scale it covers 85% of each ribbon and the last 15% is on screen from the
 * first frame. The length is measured in the host space instead (`hostScale`):
 * sample each path at 24 equal arc-length steps, apply the svg's non-uniform
 * viewBox scale to each step, sum, and pad by 2px. The dash's off-run is far
 * longer than any ribbon (`DASH_GAP`), so the pattern cannot repeat within a
 * path even where an engine's dash unit differs from the measured one. The
 * dash is cleared once the draw finishes so a resize can never re-expose a
 * stale pattern.
 *
 * Reduced motion paints the stream complete on first paint and never animates.
 *
 * ## The hover read-out (2026-09-17)
 *
 * The ribbons are anonymous ink until the pointer reaches one: the base layers
 * dim, that ribbon is re-drawn on top at full strength, and a tip at the pointer
 * names the record (`RibbonModel.who` / `move` / `months`, all computed on the
 * server). The tip is positioned in the channel's LAYOUT space — `clientX` and
 * the channel's rect are both zoomed, and their difference divided by the
 * rendered/layout width ratio is not (the same trap as `hostScale`). Touch taps
 * pin a ribbon; a tap on the bare channel clears it. Hover-only by design: the
 * svg is presentational and the legend beneath carries the counts in text.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import { FolderTabs } from '@/components/ui/folder-tabs';

import { STREAM_VB_H, type ResultsGroupModel } from './results-model';

/** One summary card, from `pages.results.legend`. */
export interface ResultsLegendCard {
  readonly id: string;
  /** Keys the group's counts — `topBand` / `secondBand` / `bigJumps` / `anyImprovement`. */
  readonly metric: string;
  readonly emoji: string;
  readonly label: string;
}

/** Copy for the interactive block, all from `pages.results`. */
export interface ResultsPanelCopy {
  readonly tabsLabel: string;
  /** Printed before each tab's record count — `n = `. Carries its own trailing space. */
  readonly tabsCountLabel: string;
  readonly stream: {
    readonly fromLabel: string;
    readonly toLabel: string;
  };
  readonly legend: readonly ResultsLegendCard[];
  /** `Over the {n} published records in {group}` — both placeholders are filled per group. */
  readonly legendScope: string;
}

export interface ResultsPanelProps {
  readonly groups: readonly ResultsGroupModel[];
  readonly copy: ResultsPanelCopy;
}

/** Draw timings, artifact lines 2649–2661. */
const DRAW_MS = 1600;
const STAGGER_MS = 40;
/** Tail pad before the dash is cleared, so the clear can never clip the last ribbon. */
const TAIL_MS = 160;
/** Samples per path when measuring host length. */
const SAMPLES = 24;
/**
 * The dash's off-run. Longer than any ribbon on any screen, so the pattern is
 * one dash followed by nothing: a growing segment and never a second one,
 * whatever unit an engine takes the dash in.
 */
const DASH_GAP = 1e6;

function cssVar(name: string, value: string): CSSProperties {
  return { [name]: value } as CSSProperties;
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
  const channelRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const [hot, setHot] = useState<number | null>(null);

  const scopeLine = copy.legendScope
    .replace('{n}', String(group.publishedCount))
    .replace('{group}', group.label);

  const placeTip = useCallback((event: ReactPointerEvent<Element>) => {
    const channel = channelRef.current;
    const tip = tipRef.current;
    if (!channel || !tip) return;
    const box = channel.getBoundingClientRect();
    const zoom = channel.offsetWidth ? box.width / channel.offsetWidth : 1;
    const half = tip.offsetWidth / 2 + 6;
    const x = Math.min(Math.max((event.clientX - box.left) / zoom, half), channel.clientWidth - half);
    const y = (event.clientY - box.top) / zoom;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
    tip.dataset.side = y < 64 ? 'below' : 'above';
  }, []);
  const hotRibbon = hot === null ? undefined : group.ribbons[hot];

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

      const scale = hostScale(svg);
      if (!scale) {
        paintComplete();
        return;
      }

      visRefs.current.forEach((path, index) => {
        if (!path) return;
        const length = hostLength(path, scale.sx, scale.sy);
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
              path.style.transition = `stroke-dashoffset ${DRAW_MS}ms var(--ease-draw) ${delay}ms`;
              path.style.strokeDashoffset = '0';
            }
            const glow = glowRefs.current[index];
            if (glow) {
              glow.style.transition = `stroke-dashoffset ${DRAW_MS}ms var(--ease-draw) ${delay}ms`;
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
        DRAW_MS + visRefs.current.length * STAGGER_MS + TAIL_MS,
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

        <div
          ref={channelRef}
          className="mvt-stream-ch mvt-well"
          onPointerDown={(event) => {
            if (event.pointerType !== 'touch') return;
            if (event.target instanceof Element && event.target.closest('.mvt-rib-hit')) return;
            setHot(null);
          }}
        >
          <svg
            ref={svgRef}
            className="mvt-stream-svg"
            viewBox={`0 0 1000 ${STREAM_VB_H}`}
            preserveAspectRatio="none"
            focusable="false"
            data-hot={hot === null ? undefined : ''}
          >
            <g className="mvt-rib-layer">
              {group.ribbons.map((ribbon, index) => (
                <path
                  key={ribbon.key}
                  ref={(node) => {
                    glowRefs.current[index] = node;
                  }}
                  className="mvt-rib-glow"
                  d={ribbon.d}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
            <g className="mvt-rib-layer">
              {group.ribbons.map((ribbon, index) => (
                <path
                  key={ribbon.key}
                  ref={(node) => {
                    visRefs.current[index] = node;
                  }}
                  className="mvt-rib"
                  d={ribbon.d}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
            {/* the hovered record, re-drawn complete above the dimmed layers */}
            {hotRibbon === undefined ? null : (
              <g className="mvt-rib-hi">
                <path className="mvt-rib-glow" d={hotRibbon.d} vectorEffect="non-scaling-stroke" />
                <path className="mvt-rib" d={hotRibbon.d} vectorEffect="non-scaling-stroke" />
              </g>
            )}
            {/* the hit areas: a transparent 16px stroke over every ribbon, on top */}
            <g>
              {group.ribbons.map((ribbon, index) => (
                <path
                  key={ribbon.key}
                  className="mvt-rib-hit"
                  d={ribbon.d}
                  vectorEffect="non-scaling-stroke"
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'touch') return;
                    setHot(index);
                    placeTip(event);
                  }}
                  onPointerMove={placeTip}
                  onPointerLeave={(event) => {
                    if (event.pointerType !== 'touch') setHot(null);
                  }}
                  onPointerDown={(event) => {
                    if (event.pointerType !== 'touch') return;
                    setHot((current) => (current === index ? null : index));
                    placeTip(event);
                  }}
                />
              ))}
            </g>
          </svg>
          <div ref={tipRef} className={hotRibbon === undefined ? 'mvt-rib-tip' : 'mvt-rib-tip is-on'}>
            {hotRibbon === undefined ? null : (
              <>
                <b>{hotRibbon.who}</b>
                <span className="mvt-num">
                  {hotRibbon.move}
                  {hotRibbon.months === null ? '' : ` · ${hotRibbon.months}`}
                </span>
              </>
            )}
          </div>
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

      {/* the stream's caption — counted from students.json for THIS group, never
          typed into copy */}
      <ul className="mvt-legend">
        {copy.legend.map((card) => {
          const count = group.legend[card.metric];
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
      <p className="mvt-mu mvt-legend-scope mvt-rev mvt-rev--s">{scopeLine}</p>
    </>
  );
}

function hide(path: SVGPathElement | null | undefined, length: number): void {
  if (!path) return;
  path.style.transition = 'none';
  path.style.strokeDasharray = `${length} ${DASH_GAP}`;
  path.style.strokeDashoffset = String(length);
}

/**
 * The svg's user→host scale, or `null` while it has no box (a panel behind
 * another tab). The host space is the svg's LAYOUT box — `clientWidth` /
 * `clientHeight`, which the standardised CSS `zoom` leaves un-zoomed — not
 * `getBoundingClientRect()`, which reports the zoomed, transformed box and is
 * 85% of the host width under the root's desktop scale. An engine that gives
 * an outer `<svg>` no client box falls back to the rendered box divided by its
 * accumulated zoom.
 */
function hostScale(svg: SVGSVGElement): { sx: number; sy: number } | null {
  let width = svg.clientWidth;
  let height = svg.clientHeight;
  if (!width || !height) {
    const box = svg.getBoundingClientRect();
    const zoom =
      'currentCSSZoom' in svg && typeof svg.currentCSSZoom === 'number' && svg.currentCSSZoom > 0
        ? svg.currentCSSZoom
        : 1;
    width = box.width / zoom;
    height = box.height / zoom;
  }
  if (!width || !height) return null;
  const viewBox = svg.viewBox.baseVal;
  return {
    sx: viewBox.width ? width / viewBox.width : 1,
    sy: viewBox.height ? height / viewBox.height : 1,
  };
}

/**
 * Host-space length of a path under a non-uniform viewBox scale: sample at
 * {@link SAMPLES} equal user-space arc-length steps, scale each step by the
 * svg's own `sx` / `sy`, and sum. `+2px` of rounding pad so the dash can never
 * fall short and leave a gap at the end of the draw.
 */
function hostLength(path: SVGPathElement, sx: number, sy: number): number {
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
