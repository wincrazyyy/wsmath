/**
 * Results section — the derived, serialisable model.
 *
 * Everything the group tabs, the rising stream, the grade matrix and the four
 * summary counts display is computed **here, on the server, at build time**,
 * from `programmes.json`, `students.json` and `grade-scales.json`. The client
 * component receives plain data (path `d` strings, gutter fractions, cell
 * counts, record labels) and adds only draw-on, hover and tab behaviour — so
 * the section's data is complete in the prerendered HTML.
 *
 * Executable spec: the locked artifact `scratchpad/v6-3-2.html`, JS §6 (data,
 * lines 2462–2497), §7 (stream geometry, 2499–2686) and §8 (matrix, 2688–2762).
 * Written spec: `scratchpad/spec/sections/results.md`, `spec/behaviours.md`
 * §4–§6.
 *
 * **students.json is authoritative.** The artifact's baked `GROUPS` arrays have
 * drifted from it (names, cohort years, durations); every figure below is
 * recounted from the JSON. The four summary counts reproduce the artifact's
 * 19 / 39 / 40 / 45 exactly — because they are correct, not because they were
 * copied.
 *
 * Pure and React-free: standard library plus `@/lib/grades` and
 * `@/lib/results-stats`.
 */

import type { GradeScale, Programme, Student } from '@/content/schema';
import { binOf, type BinIndex } from '@/lib/grades';
import {
  enrichRows,
  summaryCounts,
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
  /** Read-out line, e.g. `Marcus Li 2025 6→7 (10mo)`. */
  readonly label: string;
}

/** One tick on a gutter rail. */
export interface GutterTick {
  /** The band as recorded, e.g. `7`, `A*`, `A(8)`. */
  readonly label: string;
  /** `yOf(grade) / 620` — CSS positions at `top: calc(var(--stream-h) * var(--p))`. */
  readonly p: number;
}

/** One matrix cell: a final grade × an improvement bin. */
export interface MatrixCellModel {
  readonly binIndex: BinIndex;
  readonly count: number;
  /** Champlevé heat: ≥5 → `t3`, ≥3 → `t2`, ≥1 → `t1`; `null` for an empty cell. */
  readonly tier: 't1' | 't2' | 't3' | null;
  /** Indices into {@link ResultsGroupModel.ribbons} — the records this cell lights. */
  readonly ribbonIndices: readonly number[];
  /** Those records' read-out lines, in group order. */
  readonly records: readonly string[];
}

/** One matrix row: a final grade across all four bins. */
export interface MatrixRowModel {
  /** 0-based index of the final grade on its scale — sorted descending. */
  readonly gradeIndex: number;
  /** The band as recorded on the scale, e.g. `7`, `A*`, `A(8)`. */
  readonly gradeLabel: string;
  readonly cells: readonly MatrixCellModel[];
}

/** One programme group — one tab, one stream, one matrix. */
export interface ResultsGroupModel {
  readonly id: string;
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
  /** `headline · detail` — the read-out's group name. */
  readonly name: string;
  /** Full group size including unpublished records — the tab's `n =`. */
  readonly totalCount: number;
  /** Records published by name — the ribbons actually drawn. */
  readonly publishedCount: number;
  readonly gutters: readonly GutterTick[];
  readonly ribbons: readonly RibbonModel[];
  readonly rows: readonly MatrixRowModel[];
}

/** One summary count with its share of the published records. */
export interface LegendCount {
  readonly count: number;
  /** `42%` — rounded, never typed in copy. */
  readonly percent: string;
}

export interface ResultsModel {
  readonly groups: readonly ResultsGroupModel[];
  /** By `SummaryCard.metric` — `topBand` / `secondBand` / `bigJumps` / `anyImprovement`. */
  readonly legend: Readonly<Record<string, LegendCount>>;
  /** Published-by-name records across every group (45). */
  readonly publishedTotal: number;
}

/* ──────────────────────────── construction ───────────────────────────── */

/** `IBDP · HL / AAHL / AIHL` → `['IBDP', 'HL / AAHL / AIHL']`. Splits at the FIRST separator. */
function splitFullLabel(fullLabel: string): [string, string] {
  const at = fullLabel.indexOf(' · ');
  if (at < 0) return [fullLabel, ''];
  return [fullLabel.slice(0, at), fullLabel.slice(at + 3)];
}

/**
 * The read-out line for one record: `Marcus Li 2025 6→7 (10mo)`.
 *
 * The bands are the strings **as recorded** (`B(6)` stays `B(6)`, even where the
 * scale's sixth rung is written `C(6)` — see `docs/07-content-conflicts.md`
 * §A1), not the scale's own label at that index: the records migrate
 * byte-for-byte.
 */
function recordLabel(row: StatRow): string {
  const duration = row.monthsCompact === null ? '' : ` (${row.monthsCompact})`;
  return `${row.name} ${row.year} ${row.fromLabel}→${row.toLabel}${duration}`;
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

  const groups = inputs.map((input, index) => buildGroup(ordered[index], input));
  const counts = summaryCounts(inputs);
  const share = (n: number): LegendCount => ({
    count: n,
    percent: `${counts.total === 0 ? 0 : Math.round((n / counts.total) * 100)}%`,
  });

  return {
    groups,
    legend: {
      topBand: share(counts.top1),
      secondBand: share(counts.top2),
      bigJumps: share(counts.big),
      anyImprovement: share(counts.any),
    },
    publishedTotal: counts.total,
  };
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
      label: recordLabel(row),
    };
  });

  const gutters: GutterTick[] = bands.map((band, index) => ({
    label: band.value,
    p: yOf(index + 1, bands.length) / STREAM_VB_H,
  }));

  return {
    id: programme.id,
    headline,
    tabLabel: programme.tabLabel,
    detail,
    name: `${headline} · ${detail}`,
    totalCount: programme.totalCount,
    publishedCount: rows.length,
    gutters,
    ribbons,
    rows: buildMatrixRows(rows, bands.map((band) => band.value)),
  };
}

/**
 * Rows are the distinct FINAL grades present in the group, highest first;
 * columns are the four improvement bins (artifact `buildMatrix`, lines
 * 2721–2762). Regressions are excluded rather than filed under "0–1", matching
 * `buildMatrix` in `@/lib/results-stats`.
 */
function buildMatrixRows(
  rows: readonly StatRow[],
  bandValues: readonly string[],
): MatrixRowModel[] {
  const byGrade = new Map<number, number[][]>();
  rows.forEach((row, index) => {
    if (row.delta < 0) return;
    let bins = byGrade.get(row.toIndex);
    if (bins === undefined) {
      bins = [[], [], [], []];
      byGrade.set(row.toIndex, bins);
    }
    bins[binOf(row.delta)].push(index);
  });

  return [...byGrade.keys()]
    .sort((a, b) => b - a)
    .map((gradeIndex) => {
      const bins = byGrade.get(gradeIndex) ?? [[], [], [], []];
      return {
        gradeIndex,
        gradeLabel: bandValues[gradeIndex] ?? String(gradeIndex + 1),
        cells: bins.map((ribbonIndices, binIndex) => ({
          binIndex: binIndex as BinIndex,
          count: ribbonIndices.length,
          tier: tierOf(ribbonIndices.length),
          ribbonIndices,
          records: ribbonIndices.map((index) => recordLabel(rows[index])),
        })),
      };
    });
}

function tierOf(count: number): 't1' | 't2' | 't3' | null {
  if (count === 0) return null;
  if (count >= 5) return 't3';
  if (count >= 3) return 't2';
  return 't1';
}
