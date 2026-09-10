/**
 * Results section — the derived, serialisable model.
 *
 * Everything the group tabs, the rising stream and the summary legend display is
 * computed **here, on the server, at build time**, from `programmes.json`,
 * `students.json` and `grade-scales.json`. The client component receives plain
 * data (path `d` strings, gutter fractions, counts) and adds only draw-on and
 * tab behaviour — so the section's data is complete in the prerendered HTML.
 *
 * Executable spec: the locked artifact `scratchpad/v6-3-2.html`, JS §6 (data,
 * lines 2462–2497) and §7 (stream geometry, 2499–2686).
 * Written spec: `scratchpad/spec/sections/results.md`, `spec/behaviours.md`
 * §4–§5.
 *
 * **students.json is authoritative.** The artifact's baked `GROUPS` arrays have
 * drifted from it (names, cohort years, durations); every figure below is
 * recounted from the JSON.
 *
 * The legend counts are **per group**, not global: they caption the stream that
 * is on screen, so they are computed once per group from that group's published
 * records and re-read when the tab changes.
 *
 * Pure and React-free: standard library plus `@/lib/results-stats`.
 */

import type { GradeScale, Programme, Student } from '@/content/schema';
import {
  enrichRows,
  summaryCountsOf,
  type GroupInput,
  type StatRow,
} from '@/lib/results-stats';

/* ─────────────────────────── stream geometry ─────────────────────────── */

/** viewBox height. The svg is `0 0 1000 620` with `preserveAspectRatio=none`. */
export const STREAM_VB_H = 620;
/** y of the top grade. */
const Y_TOP = 30;
/** vertical span from the top grade to the bottom grade. */
const Y_SPAN = 560;
/** viewBox units between two records that share a grade (they fan symmetrically). */
const SPREAD = 9;

/**
 * y of grade `gr` (1-based, 1 = lowest) on a scale of `n` bands.
 * Grade 1 sits at the bottom (y 590), the top grade at y 30.
 */
export function yOf(gr: number, n: number): number {
  return Y_TOP + (1 - (gr - 1) / (n - 1)) * Y_SPAN;
}

/* ───────────────────────────── model types ───────────────────────────── */

/** One published record, drawn as one ribbon. */
export interface RibbonModel {
  /** Stable key — the student id plus the programme, never an array index. */
  readonly key: string;
  /** Cubic path in viewBox space, flat at both ends. */
  readonly d: string;
}

/** One tick on a gutter rail. */
export interface GutterTick {
  /** The band as recorded, e.g. `7`, `A*`, `A(8)`. */
  readonly label: string;
  /** `yOf(grade) / 620` — CSS positions at `top: calc(var(--stream-h) * var(--p))`. */
  readonly p: number;
}

/** One summary count with its share of the records it was counted over. */
export interface LegendCount {
  readonly count: number;
  /** `42%` — rounded, never typed in copy. */
  readonly percent: string;
}

/** One programme group — one tab, one stream, one legend. */
export interface ResultsGroupModel {
  readonly id: string;
  /** `programmes.label` — the prose name (`IBDP · HL`, `A-Level Further Math`). */
  readonly label: string;
  /** `fullLabel` before the first ` · ` — the tab's headline. */
  readonly headline: string;
  /**
   * `programmes.tabLabel` — the short, already-unique name (`IBDP · HL`).
   *
   * The phone tab prints this instead of `headline` + `detail`. Four of the six
   * headlines are ambiguous on their own (two read `IBDP`, two read `IGCSE`),
   * so a narrow tab that sheds `detail` sheds the only thing telling HL from SL
   * — on screen *and* in the tab's accessible name.
   */
  readonly tabLabel: string;
  /** `fullLabel` after the first ` · ` — the tab's second line. */
  readonly detail: string;
  /** Full group size including unpublished records — the tab's `n =`. */
  readonly totalCount: number;
  /** Records published by name — the ribbons actually drawn, and the legend's `n`. */
  readonly publishedCount: number;
  readonly gutters: readonly GutterTick[];
  readonly ribbons: readonly RibbonModel[];
  /**
   * This group's summary counts, by `SummaryCard.metric` — `topBand` /
   * `secondBand` / `bigJumps` / `anyImprovement`. Counted over
   * {@link publishedCount} records, so every percentage is a share of the stream
   * above it.
   */
  readonly legend: Readonly<Record<string, LegendCount>>;
}

export interface ResultsModel {
  readonly groups: readonly ResultsGroupModel[];
}

/* ──────────────────────────── construction ───────────────────────────── */

/** `IBDP · HL / AAHL / AIHL` → `['IBDP', 'HL / AAHL / AIHL']`. Splits at the FIRST separator. */
function splitFullLabel(fullLabel: string): [string, string] {
  const at = fullLabel.indexOf(' · ');
  if (at < 0) return [fullLabel, ''];
  return [fullLabel.slice(0, at), fullLabel.slice(at + 3)];
}

/**
 * Fan the records that share a grade symmetrically around that grade's y.
 *
 * The left end is ordered by (from, to, name) and the right end by
 * (to, from, name), so both gutters read as stacked distributions
 * (artifact `ribbonEnds`, lines 2513–2537).
 */
function ribbonEnds(
  rows: readonly StatRow[],
  bandCount: number,
): { readonly left: number[]; readonly right: number[] } {
  const indices = rows.map((_, index) => index);
  const byLeft = [...indices].sort((p, q) => {
    const a = rows[p];
    const b = rows[q];
    return a.fromIndex - b.fromIndex || a.toIndex - b.toIndex || compareName(a.name, b.name);
  });
  const byRight = [...indices].sort((p, q) => {
    const a = rows[p];
    const b = rows[q];
    return a.toIndex - b.toIndex || a.fromIndex - b.fromIndex || compareName(a.name, b.name);
  });

  const left: number[] = new Array<number>(rows.length).fill(0);
  const right: number[] = new Array<number>(rows.length).fill(0);
  fan(byLeft, (index) => rows[index].fromIndex, left, bandCount);
  fan(byRight, (index) => rows[index].toIndex, right, bandCount);
  return { left, right };
}

function compareName(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function fan(
  order: readonly number[],
  gradeOf: (index: number) => number,
  out: number[],
  bandCount: number,
): void {
  for (let i = 0; i < order.length; ) {
    const grade = gradeOf(order[i]);
    const run: number[] = [];
    while (i < order.length && gradeOf(order[i]) === grade) {
      run.push(order[i]);
      i += 1;
    }
    const centre = yOf(grade + 1, bandCount);
    for (let j = 0; j < run.length; j += 1) {
      out[run[j]] = centre + (j - (run.length - 1) / 2) * SPREAD;
    }
  }
}

/**
 * Build the whole section model.
 *
 * @throws {import('@/lib/grades').UnknownGradeError} when a record's band is not
 * on its programme's scale — a typo breaks the build rather than publishing a
 * wrong figure. (`parseContent` already surfaces this as a named ContentError.)
 */
export function buildResultsModel(
  programmes: readonly Programme[],
  students: readonly Student[],
  gradeScales: readonly GradeScale[],
): ResultsModel {
  const scaleById = new Map(gradeScales.map((scale) => [scale.id, scale]));
  const ordered = [...programmes].sort((a, b) => a.order - b.order);

  const inputs: GroupInput[] = ordered.map((programme) => {
    const scale = scaleById.get(programme.gradeScaleId);
    if (scale === undefined) {
      throw new Error(
        `results: programme "${programme.id}" references unknown grade scale "${programme.gradeScaleId}".`,
      );
    }
    return {
      programmeId: programme.id,
      label: programme.label,
      tabLabel: programme.tabLabel,
      sub: programme.sub,
      totalCount: programme.totalCount,
      scale,
      rows: students.flatMap((student) =>
        student.results
          .filter((result) => result.programmeId === programme.id && result.published)
          .map((result) => ({
            studentId: student.id,
            name: student.name,
            year: student.cohortYear,
            from: result.gradeFrom,
            to: result.gradeTo,
            months: result.months ?? null,
            predicted: result.predicted,
          })),
      ),
    };
  });

  return { groups: inputs.map((input, index) => buildGroup(ordered[index], input)) };
}

function buildGroup(programme: Programme, input: GroupInput): ResultsGroupModel {
  const [headline, detail] = splitFullLabel(programme.fullLabel);
  const rows = enrichRows(input);
  const bands = [...input.scale.bands].sort((a, b) => a.order - b.order);
  const ends = ribbonEnds(rows, bands.length);

  const ribbons: RibbonModel[] = rows.map((row, index) => {
    const yl = ends.left[index].toFixed(2);
    const yr = ends.right[index].toFixed(2);
    return {
      key: `${row.studentId}-${row.programmeId}`,
      d: `M 0 ${yl} C 420 ${yl}, 580 ${yr}, 1000 ${yr}`,
    };
  });

  const gutters: GutterTick[] = bands.map((band, index) => ({
    label: band.value,
    p: yOf(index + 1, bands.length) / STREAM_VB_H,
  }));

  // The rows are already enriched; `summaryCountsOf` counts them where
  // `summaryCounts` would enrich the group a second time.
  const counts = summaryCountsOf(rows);
  const share = (n: number): LegendCount => ({
    count: n,
    percent: `${counts.total === 0 ? 0 : Math.round((n / counts.total) * 100)}%`,
  });

  return {
    id: programme.id,
    label: programme.label,
    headline,
    tabLabel: programme.tabLabel,
    detail,
    totalCount: programme.totalCount,
    publishedCount: rows.length,
    gutters,
    ribbons,
    legend: {
      topBand: share(counts.top1),
      secondBand: share(counts.top2),
      bigJumps: share(counts.big),
      anyImprovement: share(counts.any),
    },
  };
}
