/**
 * Derived statistics for the results section (`02 · Results`).
 *
 * Everything the matrix, the distribution pyramid, the ledger and the summary
 * cards display is computed here, **server-side, at build time**, from the
 * student records. The section components receive fully-formed, serialisable
 * props and add only hover / pin / tab behaviour — the site's one differentiator
 * must not be blank with JavaScript disabled.
 *
 * Pure and dependency-free: standard library plus `./grades`. No React, no `fs`,
 * no content imports — the structural input types are declared locally so that
 * the `z.infer` types from `@/content/schema` are structurally assignable.
 *
 * Executable spec: the reference comp `hybrid-2-boundary.html` —
 * distribution 2806–2856, summary cards 2860–2891, matrix 2894–2932,
 * ledger 2998–3033.
 * Written spec: `docs/03-reuse-inventory.md` §2.1–§2.2,
 * `docs/02-content-model.md` §3.1–§3.3.
 *
 * ## Published vs. total
 *
 * `GroupInput.rows` carries only the records published by name (45 of 93);
 * `GroupInput.totalCount` is the full group size including unpublished records
 * (31 / 25 / 4 / 11 / 4 / 18 = 93). Every count derived from grades uses the
 * published rows; group headline counts use `totalCount`. The comp says this out
 * loud in its provenance lines ("N of M records in this group published by
 * name", comp line 3031).
 */

import {
  BIN_LABELS,
  RAIL_SLOTS,
  bandFromTop,
  bandsAscending,
  binOf,
  gradeDelta,
  gradeIndex,
  railSlot,
  type BinIndex,
  type GradeScaleInput,
} from './grades';

/* ------------------------------------------------------------------ inputs */

/** One published student record. */
export interface ResultRowInput {
  /** Stable slug, e.g. `"james-chow-2024"`. Never derived from array position. */
  readonly studentId: string;
  readonly name: string;
  /** Exam year, e.g. `2025`. */
  readonly year: number;
  /** Recorded starting band, e.g. `"1"`, `"F"`, `"B(6)"`. */
  readonly from: string;
  /** Recorded final band. */
  readonly to: string;
  /** Engagement length in months; may be fractional. `null` = not recorded. */
  readonly months?: number | null;
  /** `true` for the 2026 predicted results, labelled as such in the ledger. */
  readonly predicted: boolean;
}

/** One programme group — a row of the matrix, a tab of the ledger. */
export interface GroupInput {
  readonly programmeId: string;
  /** Matrix row header, e.g. `"IBDP · HL"`. */
  readonly label: string;
  /** Ledger tab label, e.g. `"IBDP · HL"` / `"A-L Further Math"`. */
  readonly tabLabel: string;
  /** Sub-line: exam-board course codes, e.g. `"AAHL / AIHL"`. */
  readonly sub: string;
  /** Full group size **including unpublished records**. */
  readonly totalCount: number;
  readonly scale: GradeScaleInput;
  /** Published-by-name records only. */
  readonly rows: readonly ResultRowInput[];
}

/* ------------------------------------------------------- enriched row model */

/** A record with every display and layout value pre-computed. */
export interface StatRow {
  readonly studentId: string;
  readonly programmeId: string;
  readonly name: string;
  readonly year: number;
  /** Recorded band strings, migrated byte-for-byte (`"B(6)"` stays `"B(6)"`). */
  readonly fromLabel: string;
  readonly toLabel: string;
  /** 0-based index on the scale (lowest band = 0). */
  readonly fromIndex: number;
  readonly toIndex: number;
  /** Column on the unified 9-slot rail — the ledger's `--f` / `--t`. */
  readonly fromSlot: number;
  readonly toSlot: number;
  /** Raw grade steps gained; `0` = maintained. */
  readonly delta: number;
  /** `0` = finished in the top band, `1` = second band. */
  readonly bandFromTop: number;
  readonly months: number | null;
  /** `true` when a duration was recorded. */
  readonly monthsRecorded: boolean;
  /** `"1 month"` / `"1.5 months"` / `"10 months"`, or `MONTHS_NOT_RECORDED`. */
  readonly monthsLabel: string;
  /** Comp's compact ledger form: `"10mo"`, `"1.5mo"`; `null` when unrecorded. */
  readonly monthsCompact: string | null;
  readonly predicted: boolean;
}

/**
 * Rendered in the ledger's duration column when no duration was recorded.
 * EN DASH (U+2013), verbatim from comp line 3013, which pairs it with
 * `aria-label="duration not recorded"`.
 */
export const MONTHS_NOT_RECORDED = '–';

/**
 * `"1 month"` / `"1.5 months"` / `"10 months"`.
 *
 * Singular **only** when `months === 1`, so `1.5` renders `"1.5 months"`
 * (`docs/03-reuse-inventory.md` §2.1). Numbers are numbers: the legacy JSON
 * stored these as strings and parsed them at four call sites.
 *
 * @throws {RangeError} on a non-finite or negative duration.
 */
export function formatMonths(months: number | null | undefined): string {
  if (months === null || months === undefined) return MONTHS_NOT_RECORDED;
  assertMonths(months);
  return `${months} ${months === 1 ? 'month' : 'months'}`;
}

/** Compact ledger form — `"10mo"`, `"1.5mo"`. `null` when unrecorded. */
export function formatMonthsCompact(
  months: number | null | undefined,
): string | null {
  if (months === null || months === undefined) return null;
  assertMonths(months);
  return `${months}mo`;
}

function assertMonths(months: number): void {
  if (!Number.isFinite(months) || months <= 0) {
    throw new RangeError(
      `Invalid engagement duration ${months}: expected a positive number of months or null`,
    );
  }
}

/**
 * Enrich one group's published records. Comp lines 2779–2789.
 *
 * Grade lookups throw on an unknown band (see `grades.ts`), so a typo in the
 * content JSON fails the build instead of publishing a wrong figure.
 */
export function enrichRows(group: GroupInput): StatRow[] {
  return group.rows.map((row) => {
    const months = row.months ?? null;
    return {
      studentId: row.studentId,
      programmeId: group.programmeId,
      name: row.name,
      year: row.year,
      fromLabel: row.from,
      toLabel: row.to,
      fromIndex: gradeIndex(group.scale, row.from),
      toIndex: gradeIndex(group.scale, row.to),
      fromSlot: railSlot(group.scale, row.from),
      toSlot: railSlot(group.scale, row.to),
      delta: gradeDelta(group.scale, row.from, row.to),
      bandFromTop: bandFromTop(group.scale, row.to),
      months,
      monthsRecorded: months !== null,
      monthsLabel: formatMonths(months),
      monthsCompact: formatMonthsCompact(months),
      predicted: row.predicted,
    };
  });
}

/* --------------------------------------------------------------- 1. matrix */

/** One cell: a group × an improvement bin. */
export interface MatrixCell {
  readonly binIndex: BinIndex;
  /** One of {@link BIN_LABELS}. */
  readonly binLabel: string;
  readonly count: number;
  /**
   * Ink intensity, `count / maxCount` rounded to 3 dp — the comp's `--t`
   * custom property (comp line 2911).
   */
  readonly intensity: number;
  /** The students in this cell, in group order; drives the read-out panel. */
  readonly rows: readonly StatRow[];
}

/** One matrix row: a programme group across all four bins. */
export interface MatrixGroupRow {
  readonly programmeId: string;
  readonly label: string;
  readonly tabLabel: string;
  readonly sub: string;
  /** Full group size, incl. unpublished — the header's `n = 31`. */
  readonly totalCount: number;
  /** Published-by-name count — the header's `12 named`. */
  readonly namedCount: number;
  /** Exactly `BIN_LABELS.length` cells, in bin order. */
  readonly cells: readonly MatrixCell[];
}

/** Column total across every group — the matrix `tfoot` (comp 2921–2925). */
export interface MatrixBinTotal {
  readonly binIndex: BinIndex;
  readonly binLabel: string;
  readonly count: number;
}

export interface Matrix {
  readonly binLabels: readonly string[];
  readonly groups: readonly MatrixGroupRow[];
  readonly totals: readonly MatrixBinTotal[];
  /** Largest single-cell count; the denominator behind every `intensity`. */
  readonly maxCount: number;
  /** Published records represented in the grid. */
  readonly namedTotal: number;
  /**
   * Records dropped because the student regressed (`delta < 0`).
   * `binOf` would otherwise file them under "0–1" and overstate that column.
   * Expected to be `0` for the current dataset; surfaced rather than hidden.
   */
  readonly negativeExcluded: number;
}

/**
 * Build the improvement matrix: groups × four improvement bins.
 * Comp lines 2894–2926.
 *
 * Maintained results (`delta === 0`) belong to bin `0` ("0–1"); regressions are
 * excluded and counted in {@link Matrix.negativeExcluded}.
 */
export function buildMatrix(groups: readonly GroupInput[]): Matrix {
  let negativeExcluded = 0;

  const binned = groups.map((group) => {
    const bins: StatRow[][] = BIN_LABELS.map(() => []);
    for (const row of enrichRows(group)) {
      if (row.delta < 0) {
        negativeExcluded += 1;
        continue;
      }
      bins[binOf(row.delta)].push(row);
    }
    return { group, bins };
  });

  let maxCount = 0;
  for (const { bins } of binned) {
    for (const cell of bins) {
      if (cell.length > maxCount) maxCount = cell.length;
    }
  }

  const totals: number[] = BIN_LABELS.map(() => 0);
  const matrixGroups: MatrixGroupRow[] = binned.map(({ group, bins }) => {
    const cells: MatrixCell[] = bins.map((rows, index) => {
      const binIndex = index as BinIndex;
      totals[binIndex] += rows.length;
      return {
        binIndex,
        binLabel: BIN_LABELS[binIndex],
        count: rows.length,
        intensity: maxCount === 0 ? 0 : round3(rows.length / maxCount),
        rows,
      };
    });
    return {
      programmeId: group.programmeId,
      label: group.label,
      tabLabel: group.tabLabel,
      sub: group.sub,
      totalCount: group.totalCount,
      namedCount: group.rows.length,
      cells,
    };
  });

  return {
    binLabels: BIN_LABELS,
    groups: matrixGroups,
    totals: totals.map((count, index) => ({
      binIndex: index as BinIndex,
      binLabel: BIN_LABELS[index],
      count,
    })),
    maxCount,
    namedTotal: totals.reduce((sum, count) => sum + count, 0),
    negativeExcluded,
  };
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/* --------------------------------------------------------- 2. distribution */

/**
 * Rail band labels, slot 0 → 8. The rail is the IGCSE scale by construction
 * (nine bands, `railOffset` 0), so slot `k` reads `U·1 … A*·9` (comp line 2854).
 * Overridable via {@link DistributionOptions} so the schema stays the source of
 * truth if the scale is ever edited in the editor.
 */
export const RAIL_BAND_LABELS = [
  'U',
  'G',
  'F',
  'E',
  'D',
  'C',
  'B',
  'A',
  'A*',
] as const;

/** One x-axis tick under the distribution plot (comp lines 2851–2856). */
export interface DistributionTick {
  readonly slot: number;
  /** Upper label: the IBDP digit, `"1"…"7"` for slots 2–8; `null` for 0–1. */
  readonly upper: string | null;
  /** Lower band letter, `"U"…"A*"`. */
  readonly lowerBand: string;
  /** Lower 1-based number, `1…9`. */
  readonly lowerNumber: number;
  /** Assembled lower label, verbatim comp separator: `"U · 1"`. */
  readonly lower: string;
  /** Left edge of the tick's centre, as a percentage of the plot width. */
  readonly centerPct: number;
}

export interface Distribution {
  /** Counts per rail slot **before** — school predicted / mock. */
  readonly before: readonly number[];
  /** Counts per rail slot **after** — final exam result. */
  readonly after: readonly number[];
  readonly maxBefore: number;
  readonly maxAfter: number;
  /** Published records plotted (`n = 45`). */
  readonly total: number;
  readonly medianBefore: number;
  readonly medianAfter: number;
  /** `medianAfter − medianBefore` — the bracket's headline number. */
  readonly medianDelta: number;
  readonly medianBeforePct: number;
  readonly medianAfterPct: number;
  /** Width of the median bracket, `medianAfterPct − medianBeforePct`. */
  readonly bracketWidthPct: number;
  /** `"median +2 grades"` — comp line 2848, verbatim including plurality. */
  readonly bracketLabel: string;
  readonly ticks: readonly DistributionTick[];
}

export interface DistributionOptions {
  /** Rail labels, slot 0 → 8. Defaults to {@link RAIL_BAND_LABELS}. */
  readonly railLabels?: readonly string[];
}

/**
 * Before / after grade distribution over every published record, on the unified
 * 9-slot rail. Comp lines 2806–2856.
 */
export function buildDistribution(
  groups: readonly GroupInput[],
  options: DistributionOptions = {},
): Distribution {
  const railLabels = options.railLabels ?? RAIL_BAND_LABELS;
  if (railLabels.length !== RAIL_SLOTS) {
    throw new RangeError(
      `buildDistribution: expected ${RAIL_SLOTS} rail labels, received ${railLabels.length}`,
    );
  }

  const before = new Array<number>(RAIL_SLOTS).fill(0);
  const after = new Array<number>(RAIL_SLOTS).fill(0);
  let total = 0;

  for (const group of groups) {
    for (const row of enrichRows(group)) {
      before[row.fromSlot] += 1;
      after[row.toSlot] += 1;
      total += 1;
    }
  }

  const medianBefore = medianSlot(before);
  const medianAfter = medianSlot(after);
  const medianBeforePct = slotCenterPct(medianBefore);
  const medianAfterPct = slotCenterPct(medianAfter);

  const ticks: DistributionTick[] = [];
  for (let slot = 0; slot < RAIL_SLOTS; slot += 1) {
    ticks.push({
      slot,
      upper: slot >= 2 ? String(slot - 1) : null,
      lowerBand: railLabels[slot],
      lowerNumber: slot + 1,
      lower: `${railLabels[slot]} · ${slot + 1}`,
      centerPct: slotCenterPct(slot),
    });
  }

  return {
    before,
    after,
    maxBefore: Math.max(...before),
    maxAfter: Math.max(...after),
    total,
    medianBefore,
    medianAfter,
    medianDelta: medianAfter - medianBefore,
    medianBeforePct,
    medianAfterPct,
    bracketWidthPct: medianAfterPct - medianBeforePct,
    bracketLabel: `median +${medianAfter - medianBefore} grades`,
    ticks,
  };
}

/**
 * Median rail slot of a 9-slot count vector: the first slot at which the
 * cumulative count reaches `ceil(n / 2)`. Comp lines 2834–2839, verbatim —
 * including the empty-vector case, which returns slot `0`.
 */
export function medianSlot(counts: readonly number[]): number {
  const n = counts.reduce((sum, value) => sum + value, 0);
  const threshold = Math.ceil(n / 2);
  let cumulative = 0;
  for (let slot = 0; slot < RAIL_SLOTS; slot += 1) {
    cumulative += counts[slot] ?? 0;
    if (cumulative >= threshold) return slot;
  }
  return RAIL_SLOTS - 1;
}

/**
 * Horizontal centre of a rail slot as a percentage of the plot width:
 * `(slot + 0.5) / 9 × 100`. Comp line 2842 (`ctr`).
 */
export function slotCenterPct(slot: number): number {
  return ((slot + 0.5) / RAIL_SLOTS) * 100;
}

/* --------------------------------------------------------------- 3. ledger */

/** One tick on a ledger panel's grade axis (comp lines 3005–3009). */
export interface LedgerTick {
  /** Display label, from the band's `label`. */
  readonly label: string;
  /** The recorded band value, for callers that prefer it to the label. */
  readonly value: string;
  /** Column on the unified rail — the comp's `left: calc(slot * var(--pitch))`. */
  readonly slot: number;
  /** `true` for the highest band; the comp styles it `.top`. */
  readonly isTop: boolean;
}

export interface Ledger {
  readonly programmeId: string;
  readonly label: string;
  readonly tabLabel: string;
  readonly sub: string;
  readonly totalCount: number;
  readonly namedCount: number;
  readonly ticks: readonly LedgerTick[];
  /** Sorted rows, ready to render in order. */
  readonly rows: readonly StatRow[];
}

/**
 * Axis ticks for a scale, lowest → highest, positioned on the unified rail.
 * Comp lines 3005–3009.
 */
export function axisTicks(scale: GradeScaleInput): LedgerTick[] {
  const ascending = bandsAscending(scale);
  return ascending.map((band, index) => ({
    label: band.label,
    value: band.value,
    slot: scale.railOffset + index,
    isTop: index === ascending.length - 1,
  }));
}

/**
 * One ledger panel: axis ticks plus rows sorted `fromSlot` ascending, ties
 * broken by the larger improvement first (`a.fs - b.fs || b.d - a.d`,
 * comp line 3012). That is what makes the tracks fan out from the bottom-left.
 */
export function buildLedger(group: GroupInput): Ledger {
  const rows = enrichRows(group).sort(
    (a, b) => a.fromSlot - b.fromSlot || b.delta - a.delta,
  );
  return {
    programmeId: group.programmeId,
    label: group.label,
    tabLabel: group.tabLabel,
    sub: group.sub,
    totalCount: group.totalCount,
    namedCount: group.rows.length,
    ticks: axisTicks(group.scale),
    rows,
  };
}

/** Every ledger panel, in group order. */
export function buildLedgers(groups: readonly GroupInput[]): Ledger[] {
  return groups.map(buildLedger);
}

/* -------------------------------------------------------- 4. summary cards */

/**
 * The four derived headline counts. Comp lines 2864–2876 — never retyped in
 * copy, always counted from the published records.
 */
export interface SummaryCounts {
  /** Finished in the top band: 7 / A* / 9. */
  readonly top1: number;
  /** Finished in the top two bands: 6–7 / A–A* / 8–9. */
  readonly top2: number;
  /** Gained ≥ 2 raw grade steps. */
  readonly big: number;
  /** Gained ≥ 1 raw grade step. */
  readonly any: number;
  /** Published-by-name records the counts are drawn from. */
  readonly total: number;
}

/** Count the summary cards across every group. Comp lines 2864–2876. */
export function summaryCounts(groups: readonly GroupInput[]): SummaryCounts {
  let top1 = 0;
  let top2 = 0;
  let big = 0;
  let any = 0;
  let total = 0;

  for (const group of groups) {
    for (const row of enrichRows(group)) {
      total += 1;
      if (row.bandFromTop === 0) top1 += 1;
      if (row.bandFromTop <= 1) top2 += 1;
      if (row.delta >= 2) big += 1;
      if (row.delta >= 1) any += 1;
    }
  }

  return { top1, top2, big, any, total };
}

/** Full group size across every group — 93 records, published or not. */
export function totalRecordCount(groups: readonly GroupInput[]): number {
  return groups.reduce((sum, group) => sum + group.totalCount, 0);
}

/** Published-by-name records across every group — 45. */
export function publishedRecordCount(groups: readonly GroupInput[]): number {
  return groups.reduce((sum, group) => sum + group.rows.length, 0);
}
