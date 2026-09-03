/**
 * The one written credential line every testimonial carries, derived — never
 * typed. `testimonials.json` is byte-authoritative and read-only, so both the
 * featured plates and the drifting sheets compose their line from the same
 * fields here rather than storing a pre-written sentence that could drift from
 * the grade columns in `students.json`.
 *
 * Shape (artifact `.mvt-feat-h .mvt-mu` / `.mvt-sheet-f > span > span`):
 *
 *   `IBDP AAHL — From Level 6 to 7 [in 7 months]`            featured plate
 *   `IBDP AASL — From 4 to 7 [in 16 months] · HKU`           drifting sheet
 *
 * The em dash, the square brackets and the `·` separator are the artifact's and
 * are load-bearing punctuation (`CLAUDE.md` §1). `gradePrefix` ("Level ") is
 * carried by exactly one record so the published line stays byte-identical to
 * the legacy site; it belongs to the written line only, never to the arrow chips
 * or the results table.
 */
import type { Testimonial } from '@/content/schema';

/** `full name → short name`, from `pages.voices.trough.universityShortNames`. */
export type UniversityShortNames = ReadonlyMap<string, string>;

export interface CredentialOptions {
  /**
   * Append ` · {university}`. The featured plates give the university its own
   * line at full length; the 340px sheets fold it into the credential line and
   * abbreviate it through {@link UniversityShortNames}.
   */
  readonly university?: UniversityShortNames;
}

/**
 * `7` → `7`, `1.5` → `1.5`. Kept as a number in content (`CLAUDE.md`
 * "numbers are numbers") and formatted only here.
 */
function formatMonths(months: number): string {
  return String(months);
}

/** The credential line for one quote. */
export function credentialLine(testimonial: Testimonial, options: CredentialOptions = {}): string {
  const from = `${testimonial.gradePrefix ?? ''}${testimonial.gradeFrom}`;
  let line = `${testimonial.programmeLabel} — From ${from} to ${testimonial.gradeTo}`;
  if (testimonial.months !== undefined) line += ` [in ${formatMonths(testimonial.months)} months]`;
  if (options.university !== undefined && testimonial.university !== undefined) {
    line += ` · ${options.university.get(testimonial.university) ?? testimonial.university}`;
  }
  return line;
}

/**
 * The medal's engraving when a student's photo is withheld: first initial of the
 * first name, first initial of the last. `Joy Angela Sun` → `JS`, matching the
 * artifact's twelve.
 */
export function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter((part) => part.length > 0);
  if (parts.length === 0) return '';
  const first = [...parts[0]][0] ?? '';
  const last = parts.length > 1 ? ([...parts[parts.length - 1]][0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}
