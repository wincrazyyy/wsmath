/**
 * Grade-scale mathematics for the results section.
 *
 * Pure, dependency-free (standard library only). No React, no `fs`, no content
 * imports — the structural input types below are declared locally so that the
 * `z.infer` types produced by `@/content/schema` are structurally assignable
 * without this module ever importing the schema.
 *
 * Executable spec: the reference comp `hybrid-2-boundary.html`, lines 2765–2777
 * (`SC`, `idx`, `slot`) and 2833 (`binOf`).
 * Written spec: `docs/02-content-model.md` §3.1 (grade scales, exact-match
 * lookup that throws) and `docs/03-reuse-inventory.md` §2.1 (grade matrix).
 *
 * ## The unified 9-slot rail
 *
 * All three curricula are plotted on one 9-slot rail, right-anchored to the
 * ceiling, so the top band is a single vertical line across every scale:
 *
 * ```
 * slot     0    1    2    3    4    5    6    7    8
 * IBDP               1    2    3    4    5    6    7   (railOffset 2)
 * A-Level            F    E    D    C    B    A    A*  (railOffset 2)
 * IGCSE    U    G    F    E    D    C    B    A    A*  (railOffset 0)
 * ```
 *
 * `railOffset = RAIL_SLOTS − bands.length`, i.e. IBDP 2, A-Level 2, IGCSE 0.
 * It is stored on the scale (so the editor can edit scales) rather than
 * recomputed, but {@link railSlot} range-checks the result.
 */

/** Number of columns on the unified grade rail (comp lines 2767–2769, 2811). */
export const RAIL_SLOTS = 9;

/**
 * Matrix column labels — improvement in raw grade steps.
 * Verbatim from comp line 2832 (`BINS`); the separator is an EN DASH (U+2013).
 */
export const BIN_LABELS = ['0–1', '2', '3', '4+'] as const;

/** Index into {@link BIN_LABELS}. */
export type BinIndex = 0 | 1 | 2 | 3;

/** One band on a grade scale. `order` runs lowest → highest. */
export interface GradeBandInput {
  /** The recorded band string, e.g. `"7"`, `"A*"`, `"B(6)"`. */
  readonly value: string;
  /** Display label, e.g. `"7"`, `"A*"`, `"B (6)"`. */
  readonly label: string;
  /** Rank hint; ascending = lowest grade → highest grade. */
  readonly order: number;
}

/** A grade scale as this module needs to see it. */
export interface GradeScaleInput {
  readonly id: string;
  /** `RAIL_SLOTS − bands.length` — 2 for IBDP/A-Level, 0 for IGCSE. */
  readonly railOffset: number;
  /** Bands, lowest → highest by `order`. */
  readonly bands: readonly GradeBandInput[];
}

/**
 * Thrown when a recorded grade cannot be resolved on its scale.
 *
 * The legacy implementation substring-matched and fell back to index `0`, which
 * is what publishes wrong figures today (`docs/02-content-model.md` §3.1,
 * `docs/03-reuse-inventory.md` §2.1 "two fixes to apply"). Failing loudly is the
 * fix: a bad grade must break the build, never render as a silent `U`.
 */
export class UnknownGradeError extends Error {
  readonly scaleId: string;
  readonly value: string;

  constructor(scaleId: string, value: string, detail?: string) {
    super(
      `Unknown grade ${JSON.stringify(value)} on scale "${scaleId}"` +
        (detail ? ` — ${detail}` : ''),
    );
    this.name = 'UnknownGradeError';
    this.scaleId = scaleId;
    this.value = value;
  }
}

/**
 * A complete parenthesised band string: a bare letter/number stem, then a
 * 1-based rung in brackets, and nothing else. `"B(6)"` → `B`, `6`.
 *
 * Comp lines 2771–2776: the IGCSE branch of `idx()` reads the parenthesised
 * digit when present. Three legacy IGCSE records are literally `"B(6)"` while
 * the scale's sixth band is `C(6)` — the parenthesised digit is the
 * authoritative index, so the records migrate byte-for-byte (a non-negotiable,
 * `CLAUDE.md` §1) and still math deterministically. See
 * `docs/07-content-conflicts.md` §A1, which is still open with the owner.
 *
 * **Anchored on purpose.** The comp's unanchored `/\((\d)\)/` matched anywhere
 * in the string, which resolves `"C(6)→A(8)"`, `"B(7) resit"` and `"B (7)"` to
 * plausible-looking rungs instead of throwing — exactly the silent-fallback
 * class of bug {@link UnknownGradeError} exists to kill. The stem is also
 * checked against the scale's own stems below, so `"Z(6)"` cannot resolve.
 */
const PARENTHESISED_BAND = /^([A-Za-z0-9*]+)\((\d)\)$/;

/**
 * True when *every* band on the scale is written in `Letter(rung)` form, i.e.
 * the scale genuinely uses parenthesised notation.
 *
 * The comp gated this branch on `sc === 'igcse'` — a hardcoded id. Gating on
 * the notation itself keeps the behaviour while letting the editor rename or
 * add a scale. It also stops the branch firing on IBDP/A-Level, whose bands
 * carry no brackets at all and where `"Predicted (6)"` would otherwise resolve.
 */
function usesParenthesisedBands(scale: GradeScaleInput): boolean {
  return scale.bands.every((band) => PARENTHESISED_BAND.test(band.value));
}

function assertScale(scale: GradeScaleInput): void {
  if (scale.bands.length === 0) {
    throw new UnknownGradeError(scale.id, '', 'the scale declares no bands');
  }
}

/**
 * Bands sorted lowest → highest by `order`.
 *
 * `order` is the source of truth, not array position: the editor can reorder a
 * collection and the maths must not move with it.
 */
export function bandsAscending(scale: GradeScaleInput): GradeBandInput[] {
  return [...scale.bands].sort((a, b) => a.order - b.order);
}

/**
 * 0-based index of `value` on `scale`, lowest band = 0.
 *
 * Resolution order (comp lines 2771–2776):
 * 1. Exact match on `band.value`. Never substring, never prefix.
 * 2. On a scale that writes every band as `Letter(rung)`, a value of that exact
 *    shape whose stem is one of the scale's own stems resolves by its digit —
 *    `"B(6)"` is rung 6 even though the scale's rung 6 is `C(6)`.
 *
 * ## Effect on published output
 *
 * The legacy substring matcher returned `0` for all three `B(6)` records, so
 * they rendered in the **4+ grade improvement** column (+8/+8/+9) and inflated
 * the legacy "Major jumps" and "Grade boost" counters. They now bin at +2/+2/+3,
 * so the IGCSE · Additional row reads `[0, 3, 1, 0]` where the live site read
 * `[0, 0, 0, 4]`. That is the correct arithmetic for the data as recorded, but
 * `docs/07-content-conflicts.md` §A1 — should these read `B(7)` or `C(6)`? — is
 * still open with the owner and settling it changes the whole column again.
 *
 * @throws {UnknownGradeError} on any miss, or on a parenthesised digit outside
 * the scale's range. Deliberate: see {@link UnknownGradeError}.
 */
export function gradeIndex(scale: GradeScaleInput, value: string): number {
  assertScale(scale);

  const exact = scale.bands.find((candidate) => candidate.value === value);
  if (exact === undefined && usesParenthesisedBands(scale)) {
    const parsed = PARENTHESISED_BAND.exec(value);
    if (parsed !== null) {
      const [, stem, digit] = parsed;
      const stems = new Set(
        scale.bands.map((band) => PARENTHESISED_BAND.exec(band.value)?.[1] ?? band.value),
      );
      if (!stems.has(stem)) {
        throw new UnknownGradeError(
          scale.id,
          value,
          `"${stem}" is not a grade on this scale (expected one of ${[...stems].join(", ")})`,
        );
      }
      const index = Number(digit) - 1;
      if (index < 0 || index >= scale.bands.length) {
        throw new UnknownGradeError(
          scale.id,
          value,
          `parenthesised index ${index + 1} is outside 1..${scale.bands.length}`,
        );
      }
      return index;
    }
  }

  const band = exact;
  if (band === undefined) {
    throw new UnknownGradeError(
      scale.id,
      value,
      `expected one of ${scale.bands.map((b) => b.value).join(', ')}`,
    );
  }

  let rank = 0;
  for (const candidate of scale.bands) {
    if (candidate.order < band.order) rank += 1;
  }
  return rank;
}

/**
 * Column on the unified 9-slot rail: `railOffset + gradeIndex`.
 * Comp line 2777 (`slot`).
 *
 * @throws {UnknownGradeError} if the resulting slot falls outside `0..8`, which
 * means the scale's `railOffset` and band count disagree with the rail.
 */
export function railSlot(scale: GradeScaleInput, value: string): number {
  const slot = scale.railOffset + gradeIndex(scale, value);
  if (slot < 0 || slot >= RAIL_SLOTS) {
    throw new UnknownGradeError(
      scale.id,
      value,
      `rail slot ${slot} is outside 0..${RAIL_SLOTS - 1}; railOffset ${scale.railOffset} ` +
        `does not match ${scale.bands.length} bands (expected ${expectedRailOffset(scale)})`,
    );
  }
  return slot;
}

/** `RAIL_SLOTS − bands.length` — the value `scale.railOffset` should carry. */
export function expectedRailOffset(scale: GradeScaleInput): number {
  return RAIL_SLOTS - scale.bands.length;
}

/**
 * Raw grade steps gained: `gradeIndex(to) − gradeIndex(from)`.
 * Comp line 2784 (`d: t - f`). Negative means the record regressed.
 */
export function gradeDelta(
  scale: GradeScaleInput,
  from: string,
  to: string,
): number {
  return gradeIndex(scale, to) - gradeIndex(scale, from);
}

/**
 * Distance of `value` from the top band: `0` = top band, `1` = second band.
 * Comp line 2785 (`band: top - t`); drives the summary cards (comp 2870–2872).
 */
export function bandFromTop(scale: GradeScaleInput, value: string): number {
  assertScale(scale);
  return scale.bands.length - 1 - gradeIndex(scale, value);
}

/**
 * Matrix bin for a delta. Comp line 2833:
 * `d <= 1 → 0`, `d === 2 → 1`, `d === 3 → 2`, else `3`.
 *
 * Note that maintained results (`d === 0`) fall in bin `0` ("0–1") by design.
 * Regressions (`d < 0`) also satisfy `d <= 1`; `buildMatrix` filters them out
 * before binning rather than letting them inflate the first column.
 */
export function binOf(delta: number): BinIndex {
  if (delta <= 1) return 0;
  if (delta === 2) return 1;
  if (delta === 3) return 2;
  return 3;
}

/**
 * The `n`-th band from the top — `n = 1` is the highest band, `n = 2` the
 * second. Feeds the `{{scale.topGrade}}` / `{{scale.secondGrade}}` tokens
 * (`docs/02-content-model.md` §4.3) and the summary-card provenance copy.
 *
 * @throws {RangeError} when `n` is outside `1..bands.length`.
 */
export function topBand(scale: GradeScaleInput, n = 1): GradeBandInput {
  assertScale(scale);
  if (!Number.isInteger(n) || n < 1 || n > scale.bands.length) {
    throw new RangeError(
      `topBand(${scale.id}, ${n}): n must be an integer in 1..${scale.bands.length}`,
    );
  }
  const ascending = bandsAscending(scale);
  const band = ascending[ascending.length - n];
  // Unreachable given the range check above; kept so the return type is total.
  if (band === undefined) {
    throw new RangeError(`topBand(${scale.id}, ${n}): no band at that rank`);
  }
  return band;
}
