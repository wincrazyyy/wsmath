/**
 * Pricing derivation for the packages section (`03 · Packages`).
 *
 * Pure and dependency-free (standard library only). No React, no `fs`, no
 * content imports — the structural input types are declared locally so the
 * `z.infer` types from `@/content/schema` are structurally assignable.
 *
 * Written spec: `docs/02-content-model.md` §2.1 (derived tokens table) and
 * `docs/03-reuse-inventory.md` §2.3. Re-based on the IBDP board course by the
 * courses→packages merge (`spec/course-merge-design.md` §3.6/§3.7): the
 * flagship is now a 28-lesson × 50-minute IBDP course at HK$16,800, not the
 * retired 32-lesson Mastery System at HK$19,800.
 *
 * Compute **once** at the page boundary and pass the result down. The legacy
 * code duplicated this arithmetic in three components, and one of them ignored
 * the props it was given and re-parsed the raw config itself.
 */

/** Pricing settings — the editable money tokens. */
export interface PricingInput {
  /** Standard 1-to-1 rate per hour, e.g. `1500`. */
  readonly privateHourlyRate: number;
  /** The standard board-course price — AASL, AISL, IAL, 0607, 4MA1, e.g. `16800`. */
  readonly coursePrice: number;
  /** The higher-tier board-course price — AAHL, AIHL, 0606, e.g. `19800`. */
  readonly coursePriceHigher: number;
  /** Pre-discount list price, struck on every course page, e.g. `60000`. */
  readonly courseListPrice: number;
  /** Maximum referral rebate per student referred, e.g. `3000`. */
  readonly referralRebateMax: number;
}

/** Programme settings — the editable structural tokens. */
export interface ProgrammeInput {
  /** Minutes per 1-to-1 lesson, e.g. `90`. */
  readonly sessionMinutes: number;
  /** Minutes per live group lesson, e.g. `50`. Every board slot runs `:00–:50`. */
  readonly courseSessionMinutes: number;
  /** Lessons in one IBDP course, e.g. `28`. The flagship the ledger quotes. */
  readonly ibdpLessonCount: number;
  /** Lessons in the private intensive block, e.g. `8`. */
  readonly intensiveLessonCount: number;
}

/** Every figure the packages section is allowed to display. */
export interface DerivedPricing {
  /* ---- pass-through, so callers need one object, not three ---- */
  readonly privateHourlyRate: number;
  readonly coursePrice: number;
  readonly coursePriceHigher: number;
  readonly courseListPrice: number;
  readonly referralRebateMax: number;
  readonly sessionMinutes: number;
  readonly courseSessionMinutes: number;
  readonly ibdpLessonCount: number;
  readonly intensiveLessonCount: number;

  /* ---- derived ---- */
  /**
   * `floor(round(coursePrice / ibdpLessonCount) / 100) × 100` → **600**.
   *
   * `16800 / 28 = 600` exactly, so the legacy round-**down**-to-the-nearest-
   * hundred marketing rule yields the same "≈ HKD 600 / lesson" it did on the
   * retired 32-lesson figure. `docs/02-content-model.md` §2.1 says preserve the
   * rule exactly. It is not a rounding bug — do not "fix" it.
   */
  readonly courseRatePerLesson: number;
  /**
   * `ibdpLessonCount × (courseSessionMinutes / 60)` → **23.333…** actual hours
   * of live teaching in one IBDP course. The unrounded value; see
   * {@link ibdpTeachingHours} for the one that is printed.
   */
  readonly ibdpTeachingHoursExact: number;
  /**
   * `floor(ibdpTeachingHoursExact)` → **23**.
   *
   * Floored deliberately: the `plus` formatter runs through `Intl.NumberFormat`
   * with `maximumFractionDigits: 2`, so an unfloored value prints `23.33+`.
   * Copy quotes it as `23+ hours`, which is true of 23.33 and reads as a figure
   * rather than a measurement.
   */
  readonly ibdpTeachingHours: number;
  /**
   * `privateHourlyRate × ibdpTeachingHoursExact` → **35,000**.
   *
   * The value comparison's "the same hours 1-to-1 would be HKD 35,000" bar.
   * This finally multiplies an *hour rate* by *hours*: the retired
   * `privateEquivalentTotal` multiplied the hourly rate by a *lesson* count,
   * the hours-vs-lessons conflict `docs/07-content-conflicts.md` has carried
   * since migration. The published figure moves 48,000 → 35,000, a downward
   * correction of a price claim.
   */
  readonly ibdpPrivateEquivalent: number;
  /**
   * `privateHourlyRate × intensiveLessonCount × (sessionMinutes / 60)`
   * → **18,000**.
   *
   * **This is the published figure. Do not "correct" it down to 12,000.**
   * The legacy production page renders "Around HKD 18,000 for an 8-lesson block
   * (8 × 90 mins)" from this identical formula, and
   * `docs/02-content-model.md` §2.1 specifies it. The locked comp
   * (`hybrid-2-boundary.html` line 2280) prints "~HKD 12,000", which is a comp
   * arithmetic error — 8 × 1,500 with the 90/60 session factor dropped. Two
   * separate reviews have proposed hard-coding the card to 12,000; doing so
   * would understate a live price by HKD 6,000.
   */
  readonly intensiveBlockCost: number;
  /** `courseListPrice − coursePrice` → **43,200**. `0` when not discounted. */
  readonly saveAmount: number;
  /** `round(saveAmount / courseListPrice × 100)` → **72**. */
  readonly savePct: number;
  /**
   * `isFinite(courseListPrice) && courseListPrice > coursePrice`.
   * The "was HKD 60,000 · save 72%" block renders only when true
   * (`docs/03-reuse-inventory.md` §2.3).
   */
  readonly hasDiscount: boolean;
  /**
   * `ibdpPrivateEquivalent − coursePrice` → **18,200** — the difference at the
   * same number of teaching hours.
   */
  readonly delta: number;
  /**
   * `coursePrice / ibdpPrivateEquivalent × 100` → **48** — the width of the
   * comparison's second bar. Bar A is the 100% reference.
   */
  readonly barBWidthPct: number;
  /** Bar A is drawn to full width; kept explicit so the section retypes nothing. */
  readonly barAWidthPct: number;
}

function assertPositive(label: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(
      `derivePricing: ${label} must be a finite positive number, received ${value}`,
    );
  }
}

/**
 * Derive every displayable pricing figure from the pricing and programme
 * tokens. Deterministic, allocation-light, safe to call at build time.
 *
 * With the current tokens (`1500 / 16800 / 19800 / 60000 / 3000` and
 * `90 / 50 / 28 / 8`): `courseRatePerLesson 600`, `ibdpTeachingHours 23`,
 * `ibdpPrivateEquivalent 35000`, `intensiveBlockCost 18000`, `saveAmount 43200`,
 * `savePct 72`, `delta 18200`, `barBWidthPct 48`.
 *
 * @throws {RangeError} on a non-positive or non-finite input. A silent `0`
 * here would publish a wrong price; the legacy code had four different
 * fallbacks for the same figure.
 */
export function derivePricing(
  pricing: PricingInput,
  programme: ProgrammeInput,
): DerivedPricing {
  assertPositive('privateHourlyRate', pricing.privateHourlyRate);
  assertPositive('coursePrice', pricing.coursePrice);
  assertPositive('sessionMinutes', programme.sessionMinutes);
  assertPositive('courseSessionMinutes', programme.courseSessionMinutes);
  assertPositive('ibdpLessonCount', programme.ibdpLessonCount);
  assertPositive('intensiveLessonCount', programme.intensiveLessonCount);

  const { privateHourlyRate, coursePrice, coursePriceHigher, courseListPrice } = pricing;
  const { sessionMinutes, courseSessionMinutes, ibdpLessonCount, intensiveLessonCount } = programme;

  const sessionHours = sessionMinutes / 60;

  const courseRatePerLesson =
    Math.floor(Math.round(coursePrice / ibdpLessonCount) / 100) * 100;
  const ibdpTeachingHoursExact = ibdpLessonCount * (courseSessionMinutes / 60);
  const ibdpPrivateEquivalent = privateHourlyRate * ibdpTeachingHoursExact;
  const intensiveBlockCost =
    privateHourlyRate * intensiveLessonCount * sessionHours;

  const hasDiscount =
    Number.isFinite(courseListPrice) && courseListPrice > coursePrice;
  const saveAmount = hasDiscount ? courseListPrice - coursePrice : 0;
  const savePct = hasDiscount
    ? Math.round((saveAmount / courseListPrice) * 100)
    : 0;

  return {
    privateHourlyRate,
    coursePrice,
    coursePriceHigher,
    courseListPrice,
    referralRebateMax: pricing.referralRebateMax,
    sessionMinutes,
    courseSessionMinutes,
    ibdpLessonCount,
    intensiveLessonCount,

    courseRatePerLesson,
    ibdpTeachingHoursExact,
    ibdpTeachingHours: Math.floor(ibdpTeachingHoursExact),
    ibdpPrivateEquivalent,
    intensiveBlockCost,
    saveAmount,
    savePct,
    hasDiscount,
    delta: ibdpPrivateEquivalent - coursePrice,
    barBWidthPct: (coursePrice / ibdpPrivateEquivalent) * 100,
    barAWidthPct: 100,
  };
}
