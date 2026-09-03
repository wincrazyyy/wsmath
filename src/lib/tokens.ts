/**
 * The token engine (docs/02 §2.2).
 *
 * Every hardcoded business fact on this site is a token. Copy interpolates
 * `{{token.path}}`; nothing is retyped. Resolution is **strict** — an unknown
 * token or an unknown formatter throws, naming both the token and the content
 * field it was found in. A silent empty string in marketing copy is worse than
 * a build failure.
 *
 * Pure and isomorphic: no filesystem, no `process`, no React. The `/preview`
 * route runs this in the browser against draft content.
 */
import type { Settings } from "@/content/schema";
import { derivePricing } from "@/lib/pricing";

export type TokenValue = string | number;
export type TokenMap = Readonly<Record<string, TokenValue>>;

/** Thrown when a token cannot be resolved. Carries the field it was written in. */
export class TokenError extends Error {
  readonly token: string;
  readonly location: string;

  constructor(message: string, token: string, location: string) {
    super(message);
    this.name = "TokenError";
    this.token = token;
    this.location = location;
  }
}

const FORMATTERS = ["money", "num", "plus"] as const;
type Formatter = (typeof FORMATTERS)[number];

const DEFAULT_LOCALE = "en-HK";
const DEFAULT_CURRENCY = "HKD";

/** `{{ money pricing.coursePrice }}` → formatter `money`, path `pricing.coursePrice`. */
const TOKEN_PATTERN = /\{\{\s*([A-Za-z0-9_.-]+)(?:\s+([A-Za-z0-9_.-]+))?\s*\}\}/g;

const MONTH_ABBREVIATIONS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function isFormatter(candidate: string): candidate is Formatter {
  return (FORMATTERS as readonly string[]).includes(candidate);
}

function readLocale(tokens: TokenMap): string {
  const locale = tokens["pricing.locale"];
  return typeof locale === "string" && locale.length > 0 ? locale : DEFAULT_LOCALE;
}

function readCurrency(tokens: TokenMap): string {
  const currency = tokens["pricing.currency"];
  return typeof currency === "string" && currency.length > 0 ? currency : DEFAULT_CURRENCY;
}

function formatGrouped(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

/**
 * `16800` → `HKD 16,800` — exactly what `{{money …}}` renders.
 *
 * Exported so a check that has to compare an already-interpolated string
 * against a settings figure (`crossCheck`'s course-tier assertion) formats it
 * with the same rule the interpolation used, rather than a second copy of it
 * that can drift.
 */
export function formatMoney(value: number, currency: string, locale: string): string {
  return `${currency} ${formatGrouped(value, locale)}`;
}

function requireNumber(value: TokenValue, token: string, location: string): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new TokenError(
      `Token "${token}" is not a number, so it cannot be formatted (used in ${location}).`,
      token,
      location,
    );
  }
  return parsed;
}

/**
 * Replace every `{{token.path}}` in `input`.
 *
 * Formatters (declared, never implicit):
 *   `{{money pricing.coursePrice}}` → `HKD 16,800`
 *   `{{num stats.tutoringHours}}`   → `20,000`
 *   `{{plus stats.tutoringHours}}`  → `20,000+`
 *   `{{setup.platform}}`            → `Zoom`
 *
 * @param location where the string lives in the content tree, used in errors.
 */
export function interpolate(input: string, tokens: TokenMap, location = "content"): string {
  if (!input.includes("{{")) return input;

  return input.replace(TOKEN_PATTERN, (match: string, first: string, second: string | undefined): string => {
    const path = second === undefined ? first : second;

    let formatter: Formatter | null = null;
    if (second !== undefined) {
      if (!isFormatter(first)) {
        throw new TokenError(
          `Unknown formatter "${first}" in ${match} (used in ${location}). Available formatters: ${FORMATTERS.join(", ")}.`,
          path,
          location,
        );
      }
      formatter = first;
    }

    const value = tokens[path];
    if (value === undefined) {
      throw new TokenError(`Unknown token "${path}" in ${match} (used in ${location}).`, path, location);
    }

    if (formatter === null) return String(value);

    const locale = readLocale(tokens);
    const numeric = requireNumber(value, path, location);

    if (formatter === "money") return formatMoney(numeric, readCurrency(tokens), locale);
    if (formatter === "plus") return `${formatGrouped(numeric, locale)}+`;
    return formatGrouped(numeric, locale);
  });
}

/** Walk any JSON-ish value and interpolate every string it contains. */
export function interpolateDeep<T>(value: T, tokens: TokenMap, location = "content"): T {
  if (typeof value === "string") {
    return interpolate(value, tokens, location) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => interpolateDeep(item, tokens, `${location}[${index}]`)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      result[key] = interpolateDeep(source[key], tokens, `${location}.${key}`);
    }
    return result as unknown as T;
  }
  return value;
}

function walk(value: unknown, path: string, out: Record<string, TokenValue>): void {
  if (value === null || value === undefined || typeof value === "boolean") return;

  if (typeof value === "string" || typeof value === "number") {
    out[path] = value;
    return;
  }

  if (Array.isArray(value)) {
    const scalars: string[] = [];
    value.forEach((item, index) => {
      walk(item, `${path}.${index}`, out);
      if (typeof item === "string" || typeof item === "number") scalars.push(String(item));
    });
    if (value.length > 0 && scalars.length === value.length) out[path] = scalars.join(", ");
    return;
  }

  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walk(child, path === "" ? key : `${path}.${key}`, out);
    }
  }
}

/** "IBDP", "A-Level / IAL", "IGCSE" → "IBDP, A-Level / IAL and IGCSE". */
function joinProse(items: readonly string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export interface BuildTokenMapOptions {
  /**
   * The moment "years of experience" is measured from. Defaults to now.
   * Pass a fixed date to make a build reproducible.
   */
  readonly now?: Date;
  /** Extra tokens merged in last, e.g. the `content.*` counts derived from the collections. */
  readonly extra?: TokenMap;
}

/**
 * Derived tokens (docs/02 §2.1). Never stored — always computed, so they cannot
 * go stale and cannot disagree with the numbers they come from.
 *
 * | Token                             | Value with today's settings |
 * | --------------------------------- | --------------------------- |
 * | `pricing.courseSaveAmount`        | 43,200                      |
 * | `pricing.courseSavePct`           | 72                          |
 * | `pricing.courseRatePerLesson`     | 600                         |
 * | `pricing.ibdpPrivateEquivalent`   | 35,000                      |
 * | `pricing.intensiveBlockCost`      | 18,000                      |
 * | `pricing.courseVsPrivateSaving`   | 18,200                      |
 * | `programme.ibdpTeachingHours`     | 23                          |
 */
export function deriveTokens(settings: Settings, options: BuildTokenMapOptions = {}): Record<string, TokenValue> {
  const { stats, pricing, programme, setup } = settings;

  const now = options.now ?? new Date();
  const startYear = Number(stats.teachingSince.slice(0, 4));
  const startMonth = Number(stats.teachingSince.slice(5, 7));
  // Completed years only. `teachingSince` carries a month, so ignoring it
  // overstated the credential for the eight months from January to August of
  // every year: with "2017-09", July 2026 is 8 completed years, not 9.
  // docs/07-content-conflicts.md §A2 still has the start date open with the
  // owner — this makes the derivation honest about the date as recorded.
  const beforeAnniversary = now.getMonth() + 1 < startMonth;
  const yearsExperience = now.getFullYear() - startYear - (beforeAnniversary ? 1 : 0);

  // One implementation of the pricing arithmetic, not two. `derivePricing` is
  // pure and imports nothing, so there is no cycle. It also gates the discount
  // on `hasDiscount`, which this function previously did not — an editor who
  // set courseListPrice below coursePrice used to interpolate a NEGATIVE
  // saving into the course card while the value graph correctly drew none.
  const derived = derivePricing(pricing, programme);
  const {
    saveAmount: courseSaveAmount,
    savePct: courseSavePct,
    courseRatePerLesson,
    ibdpPrivateEquivalent,
    intensiveBlockCost,
    ibdpTeachingHours,
    delta: courseVsPrivateSaving,
  } = derived;

  const monthLabel =
    startMonth >= 1 && startMonth <= 12 ? `${MONTH_ABBREVIATIONS[startMonth - 1]} ${startYear}` : String(startYear);

  return {
    "stats.yearsExperience": yearsExperience,
    "stats.teachingSinceYear": startYear,
    "stats.teachingSinceLabel": monthLabel,
    "pricing.courseSaveAmount": courseSaveAmount,
    "pricing.courseSavePct": courseSavePct,
    "pricing.courseRatePerLesson": courseRatePerLesson,
    "pricing.ibdpPrivateEquivalent": ibdpPrivateEquivalent,
    "pricing.intensiveBlockCost": intensiveBlockCost,
    "pricing.courseVsPrivateSaving": courseVsPrivateSaving,
    "programme.ibdpTeachingHours": ibdpTeachingHours,
    "programme.curriculaLabel": joinProse(programme.curricula),
    "programme.curriculaDots": programme.curricula.join(" · "),
    "programme.curriculaSlashes": programme.curricula.join(" / "),
    "setup.equipmentList": setup.equipment.join(" + "),
  };
}

/**
 * Build the resolver map: every scalar in `settings` addressed by its dotted
 * path, plus the derived tokens, plus anything passed in `extra`.
 */
export function buildTokenMap(settings: Settings, options: BuildTokenMapOptions = {}): TokenMap {
  const map: Record<string, TokenValue> = {};
  walk(settings, "", map);
  Object.assign(map, deriveTokens(settings, options));
  if (options.extra !== undefined) Object.assign(map, options.extra);
  return map;
}

/** Every token path the map can resolve, sorted. Useful for the editor's token browser. */
export function tokenPaths(tokens: TokenMap): readonly string[] {
  return Object.keys(tokens).sort();
}
