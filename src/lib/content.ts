/**
 * Content loading and validation.
 *
 * `parseContent` is pure and isomorphic: it validates the raw JSON documents
 * against the Zod schemas, resolves every `{{token}}` in every string, and runs
 * the cross-document checks the schemas cannot express on their own. It runs at
 * build time on the server and again in the browser on `/preview`, against a
 * draft posted in from the editor.
 *
 * `loadContent` is the server-only wrapper that reads the JSON off disk.
 *
 * Content is loaded once at the page boundary and passed down as props. No
 * component ever imports a content file at module scope.
 */
import { cache } from "react";

import type { z } from "zod";

import {
  CONTENT_DOCUMENTS,
  CONTENT_DOCUMENT_KEYS,
  CourseGroups,
  Faqs,
  GradeScales,
  IaCourse,
  Packages,
  Pages,
  Programmes,
  Schools,
  Settings,
  Students,
  Testimonials,
  WhatsappPrefills,
  type ContentDocumentKey,
  type CourseGroup,
  type CtaKey,
  type Faq,
  type GradeScale,
  type Package,
  type Programme,
  type School,
  type Student,
  type Testimonial,
} from "@/content/schema";
import { RAIL_SLOTS, expectedRailOffset, gradeIndex } from "@/lib/grades";
import { buildTokenMap, formatMoney, interpolateDeep, type TokenMap, type TokenValue } from "@/lib/tokens";

/** One raw, unvalidated JSON document per file in `src/content/`. */
export type RawContentFiles = { readonly [K in ContentDocumentKey]: unknown };

/** The validated, token-resolved content set handed to the page. */
export interface SiteContent {
  readonly settings: Settings;
  readonly pages: Pages;
  readonly gradeScales: readonly GradeScale[];
  readonly programmes: readonly Programme[];
  readonly students: readonly Student[];
  readonly testimonials: readonly Testimonial[];
  readonly packages: readonly Package[];
  readonly courseGroups: readonly CourseGroup[];
  readonly faqs: readonly Faq[];
  readonly schools: readonly School[];
  readonly iaCourse: IaCourse;
  readonly whatsappPrefills: WhatsappPrefills;
  /** Every resolvable token, for components that need a value rather than a sentence. */
  readonly tokens: TokenMap;
}

export interface ParseContentOptions {
  /**
   * The moment "years of experience" is measured from. Defaults to now.
   * Pass a fixed date for a reproducible build.
   */
  readonly now?: Date;
}

/** Thrown when content is invalid, incomplete, or inconsistent across documents. */
export class ContentError extends Error {
  readonly problems: readonly string[];

  constructor(message: string, problems: readonly string[] = []) {
    super(problems.length > 0 ? `${message}\n  - ${problems.join("\n  - ")}` : message);
    this.name = "ContentError";
    this.problems = problems;
  }
}

interface ZodIssueLike {
  readonly path: readonly PropertyKey[];
  readonly message: string;
}

function describeIssues(file: string, issues: readonly ZodIssueLike[]): string[] {
  return issues.map((issue) => {
    const where = issue.path.length > 0 ? issue.path.map(String).join(".") : "(root)";
    return `${file} → ${where}: ${issue.message}`;
  });
}

function parseDocument<S extends z.ZodType>(schema: S, key: ContentDocumentKey, raw: unknown): z.infer<S> {
  const { file } = CONTENT_DOCUMENTS[key];
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ContentError(`${file} does not match the content schema.`, describeIssues(file, result.error.issues));
  }
  return result.data;
}

function duplicates(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

/**
 * Counts derived from the collections and exposed as `content.*` tokens, so a
 * sentence such as "93 students across 6 groups; 45 published here by name"
 * can never disagree with the data behind it.
 */
function contentCounts(parsed: {
  programmes: readonly Programme[];
  students: readonly Student[];
  testimonials: readonly Testimonial[];
  packages: readonly Package[];
  courseGroups: readonly CourseGroup[];
  faqs: readonly Faq[];
  schools: readonly School[];
  iaCourse: IaCourse;
}): Record<string, TokenValue> {
  const allResults = parsed.students.flatMap((student) => student.results);
  const cohortYears = parsed.students.map((student) => student.cohortYear);
  const from = cohortYears.length > 0 ? Math.min(...cohortYears) : 0;
  const to = cohortYears.length > 0 ? Math.max(...cohortYears) : 0;

  return {
    "content.studentRecordCount": parsed.programmes.reduce((total, item) => total + item.totalCount, 0),
    "content.publishedRecordCount": allResults.filter((result) => result.published).length,
    "content.predictedRecordCount": allResults.filter((result) => result.predicted).length,
    "content.studentCount": parsed.students.length,
    "content.programmeCount": parsed.programmes.length,
    "content.schoolCount": parsed.schools.length,
    "content.faqCount": parsed.faqs.length,
    "content.testimonialCount": parsed.testimonials.length,
    "content.featuredTestimonialCount": parsed.testimonials.filter((item) => item.placement === "featured").length,
    "content.carouselTestimonialCount": parsed.testimonials.filter((item) => item.placement === "carousel").length,
    "content.courseGroupCount": parsed.courseGroups.length,
    "content.courseCount": parsed.courseGroups.reduce((total, group) => total + group.courses.length, 0),
    "content.iaThemeCount": parsed.iaCourse.themes.length,
    "content.iaFeatureCount": parsed.iaCourse.features.length,
    /* Every course sold as a scheduled group course, across all boards — 8
       today. It replaces `content.leafletPageCount`, which was a `Math.max`
       across every package's leaflet and therefore wrong by construction the
       moment a second outline existed. */
    "content.boardCourseCount": parsed.packages.reduce((total, item) => total + (item.variants?.length ?? 0), 0),
    "content.cohortYearFrom": from,
    "content.cohortYearTo": to,
    "content.cohortYearRange": from === to ? String(from) : `${from}–${to}`,
  };
}

function crossCheck(content: Omit<SiteContent, "tokens">): string[] {
  const problems: string[] = [];

  const collections: ReadonlyArray<readonly [string, readonly { id: string }[]]> = [
    ["gradeScales", content.gradeScales],
    ["programmes", content.programmes],
    ["students", content.students],
    ["testimonials", content.testimonials],
    ["packages", content.packages],
    ["courseGroups", content.courseGroups],
    ["faqs", content.faqs],
    ["schools", content.schools],
  ];
  for (const [name, items] of collections) {
    const dupes = duplicates(items.map((item) => item.id));
    if (dupes.length > 0) problems.push(`${name}: duplicate id(s) ${dupes.join(", ")}. Ids must be unique and permanent.`);
  }

  const scaleIds = new Set(content.gradeScales.map((scale) => scale.id));
  const programmeIds = new Set(content.programmes.map((programme) => programme.id));
  const studentIds = new Set(content.students.map((student) => student.id));
  const testimonialIds = new Set(content.testimonials.map((item) => item.id));
  const prefillKeys = new Set(Object.keys(content.whatsappPrefills));

  for (const programme of content.programmes) {
    if (!scaleIds.has(programme.gradeScaleId)) {
      problems.push(`programmes → ${programme.id}: gradeScaleId "${programme.gradeScaleId}" is not a known grade scale.`);
    }
  }

  // Scale invariants the Zod schema cannot express. An editor edit that adds or
  // removes a band, or repeats an `order`, produces a quietly wrong chart
  // rather than an error: too small a railOffset just stops the top grade
  // lining up with the ceiling, and two bands sharing an `order` collapse onto
  // one rung so a real grade jump scores 0.
  for (const scale of content.gradeScales) {
    const expected = expectedRailOffset(scale);
    if (scale.railOffset !== expected) {
      problems.push(
        `gradeScales → ${scale.id}: railOffset ${scale.railOffset} does not match ${scale.bands.length} ` +
          `bands; expected ${expected} (railOffset = ${RAIL_SLOTS} − bands.length).`,
      );
    }
    const orderDupes = duplicates(scale.bands.map((band) => String(band.order)));
    if (orderDupes.length > 0) {
      problems.push(`gradeScales → ${scale.id}: duplicate band order(s) ${orderDupes.join(", ")}. Every band needs a distinct rung.`);
    }
    const valueDupes = duplicates(scale.bands.map((band) => band.value));
    if (valueDupes.length > 0) {
      problems.push(`gradeScales → ${scale.id}: duplicate band value(s) ${valueDupes.join(", ")}.`);
    }
  }

  const scaleById = new Map(content.gradeScales.map((scale) => [scale.id, scale]));
  const scaleByProgramme = new Map(
    content.programmes.map((programme) => [programme.id, scaleById.get(programme.gradeScaleId)] as const),
  );
  const recordsPerProgramme = new Map(content.programmes.map((programme) => [programme.id, 0]));

  for (const student of content.students) {
    for (const result of student.results) {
      if (!programmeIds.has(result.programmeId)) {
        problems.push(`students → ${student.id}: programmeId "${result.programmeId}" is not a known programme.`);
        continue;
      }
      recordsPerProgramme.set(result.programmeId, (recordsPerProgramme.get(result.programmeId) ?? 0) + 1);

      // A recorded grade that is not on its programme's scale passes Zod and
      // every other check here, then throws inside `grades.ts` during render —
      // which on /preview reports a successful render and *then* blanks the
      // iframe. Resolve it now so the typo becomes a named ContentError.
      const scale = scaleByProgramme.get(result.programmeId);
      if (scale === undefined) continue;
      for (const [field, value] of [
        ["gradeFrom", result.gradeFrom],
        ["gradeTo", result.gradeTo],
      ] as const) {
        try {
          gradeIndex(scale, value);
        } catch (error) {
          problems.push(`students → ${student.id}: ${field} — ${(error as Error).message}`);
        }
      }
    }
  }

  // `totalCount` is authored but every record now lives in students.json, so the
  // pair must agree or the colossal 93, every "n = 31" row header and every
  // ledger tab count go stale the first time the editor adds a student.
  for (const programme of content.programmes) {
    const counted = recordsPerProgramme.get(programme.id) ?? 0;
    if (programme.totalCount !== counted) {
      problems.push(
        `programmes → ${programme.id}: totalCount ${programme.totalCount} but ${counted} ` +
          `record(s) exist in students.json.`,
      );
    }
  }

  for (const testimonial of content.testimonials) {
    if (testimonial.studentId !== undefined && !studentIds.has(testimonial.studentId)) {
      problems.push(`testimonials → ${testimonial.id}: studentId "${testimonial.studentId}" is not a known student.`);
    }
    if (testimonial.avatar !== null) {
      if (!testimonial.avatar.src.startsWith("/")) {
        problems.push(`testimonials → ${testimonial.id}: avatar path "${testimonial.avatar.src}" must start with "/".`);
      }
      // Filenames are keyed off the stable id, never an array position — the
      // legacy `carousel-20.png` naming is the bug CLAUDE.md calls the most
      // dangerous latent one in the old system. Assert it so it cannot regress.
      const basename = testimonial.avatar.src.split("/").pop() ?? "";
      const stem = basename.replace(/\.[^.]+$/, "");
      if (stem !== testimonial.id) {
        problems.push(
          `testimonials → ${testimonial.id}: avatar file "${basename}" must be named for the ` +
            `testimonial id (expected "${testimonial.id}.<ext>"). Never key an asset filename off an array index.`,
        );
      }
    }
  }

  for (const clip of content.pages.voices.video.clips) {
    if (clip.testimonialId !== undefined && !testimonialIds.has(clip.testimonialId)) {
      problems.push(`pages → voices.video.clips.${clip.id}: testimonialId "${clip.testimonialId}" is not a known testimonial.`);
    }
  }

  // The drifting trough renders a curated subset of the carousel testimonials
  // by id. An id that resolves to nothing would render a hole in the loop, so
  // it fails the build here instead.
  for (const sheetId of content.pages.voices.trough.sheetIds) {
    if (!testimonialIds.has(sheetId)) {
      problems.push(`pages → voices.trough.sheetIds: "${sheetId}" is not a known testimonial.`);
    }
  }

  const ctaUses: ReadonlyArray<readonly [string, CtaKey]> = [
    ["pages.nav", content.pages.nav.ctaKey],
    ["pages.hero", content.pages.hero.ctaKey],
    ["pages.ribbon", content.pages.ribbon.ctaKey],
    ["pages.results.cta", content.pages.results.cta.ctaKey],
    ["pages.voices.video", content.pages.voices.video.ctaKey],
    ["pages.faqPage", content.pages.faqPage.ctaKey],
    ["pages.footer.getInTouch", content.pages.footer.getInTouch.ctaKey],
    ["iaCourse", content.iaCourse.ctaKey],
    ...content.packages.map((item) => [`packages.${item.id}`, item.ctaKey] as const),
  ];
  for (const [where, ctaKey] of ctaUses) {
    if (!prefillKeys.has(ctaKey)) {
      problems.push(`${where}: ctaKey "${ctaKey}" has no WhatsApp message.`);
    }
  }

  // Two cards reporting one beacon id would make analytics attribute an enquiry
  // to the wrong path, and `PlanPick` resolves its option by package id while
  // the panel reports `ctaKey` — one identifier per card, enforced.
  const ctaKeyDupes = duplicates(content.packages.map((item) => item.ctaKey));
  if (ctaKeyDupes.length > 0) {
    problems.push(
      `packages: duplicate ctaKey(s) ${ctaKeyDupes.join(", ")}. Each card needs its own WhatsApp message and beacon id.`,
    );
  }

  /* ── board courses ────────────────────────────────────────────────────────
     The outline viewer's pages come from `variants[].outlinePage`, so the two
     cannot fall out of step by construction — but a board card with no courses,
     or an outline with nothing to show, is a content mistake the renderer would
     otherwise have to lay out. It fails the build instead. */
  const courseIds = new Set(
    content.courseGroups.flatMap((group) => group.courses.map((course) => course.id)),
  );
  const variantIds: string[] = [];
  const { pricing } = content.settings;

  for (const item of content.packages) {
    const variants = item.variants ?? [];

    if (item.kind === "board" && (variants.length === 0 || item.outline === undefined)) {
      problems.push(
        `packages → ${item.id}: a board package needs at least one course and an outline.`,
      );
    }
    if (item.outline !== undefined && variants.length === 0) {
      problems.push(
        `packages → ${item.id}: has an outline but no courses. The viewer's pages come from the courses.`,
      );
    }

    for (const variant of variants) {
      variantIds.push(variant.id);

      if (variant.courseId !== undefined && !courseIds.has(variant.courseId)) {
        problems.push(
          `packages → ${item.id}.${variant.id}: courseId "${variant.courseId}" is not a course in course-groups.json.`,
        );
      }

      // `price` is display copy and `tier` is the number search engines are
      // given (json-ld's AggregateOffer bounds). Two fields describing one
      // price can disagree, so they are not allowed to: the printed string must
      // quote the figure its tier names. Checked after interpolation, against
      // the same formatter `{{money …}}` used, so decoration around the figure
      // ("from HKD 16,800") stays legal and a wrong figure does not.
      const tierPrice = variant.tier === "higher" ? pricing.coursePriceHigher : pricing.coursePrice;
      const tierMoney = formatMoney(tierPrice, pricing.currency, pricing.locale);
      if (!variant.price.includes(tierMoney)) {
        problems.push(
          `packages → ${item.id}.${variant.id}: price "${variant.price}" does not quote its ` +
            `"${variant.tier}" tier figure (${tierMoney}). Point the price at the matching ` +
            `pricing token, or change the tier.`,
        );
      }
      if (!variant.outlinePage.src.startsWith("/")) {
        problems.push(
          `packages → ${item.id}.${variant.id}: outline page "${variant.outlinePage.src}" must start with "/".`,
        );
      }
      // Same assertion, same reason, as the testimonial-avatar check above:
      // never key an asset filename off an array position.
      const basename = variant.outlinePage.src.split("/").pop() ?? "";
      const stem = basename.replace(/\.[^.]+$/, "");
      if (stem !== variant.id) {
        problems.push(
          `packages → ${item.id}.${variant.id}: outline page "${basename}" must be named for the ` +
            `course id (expected "${variant.id}.<ext>"). Never key an asset filename off an array index.`,
        );
      }
    }
  }

  const variantDupes = duplicates(variantIds);
  if (variantDupes.length > 0) {
    problems.push(
      `packages: duplicate course id(s) ${variantDupes.join(", ")} across packages. ` +
        `Outline asset paths key off them, so they must be unique site-wide.`,
    );
  }

  // Pre-existing gap, closed here: a stale display-code id used to render an
  // empty <span/> in the coverage tray, silently.
  for (const entry of content.pages.courses.displayCodes) {
    if (!courseIds.has(entry.id)) {
      problems.push(`pages → courses.displayCodes: "${entry.id}" is not a course in course-groups.json.`);
    }
  }

  // The floating panel starts on this package. A typo would silently preselect
  // whichever card happens to be first, and a package with no price yields no
  // panel option at all.
  const defaultPackageId = content.pages.packagesPage.plan.defaultPackageId;
  const defaultPackage = content.packages.find((item) => item.id === defaultPackageId);
  if (defaultPackage === undefined) {
    problems.push(
      `pages → packagesPage.plan.defaultPackageId: "${defaultPackageId}" is not a known package.`,
    );
  } else if (defaultPackage.price === undefined) {
    problems.push(
      `pages → packagesPage.plan.defaultPackageId: package "${defaultPackageId}" has no price, ` +
        `so it never reaches the plan panel.`,
    );
  }

  const markIds = new Set(content.pages.sectionMarks.map((mark) => mark.id));
  for (const section of content.settings.navSections) {
    if (!markIds.has(section.id)) {
      problems.push(`settings → navSections."${section.id}" has no matching section marker in pages.sectionMarks.`);
    }
  }

  return problems;
}

/**
 * Validate, interpolate and cross-check the whole content set.
 *
 * Tokens are resolved from the *raw* settings, so a settings value must never
 * itself contain a token — tokens are one level deep by design.
 */
export function parseContent(raw: RawContentFiles, options: ParseContentOptions = {}): SiteContent {
  const missing = CONTENT_DOCUMENT_KEYS.filter((key) => raw[key] === undefined);
  if (missing.length > 0) {
    throw new ContentError(
      "Content is not migrated yet — these documents are missing.",
      missing.map((key) => `${CONTENT_DOCUMENTS[key].file} (${CONTENT_DOCUMENTS[key].title})`),
    );
  }

  const settings = parseDocument(Settings, "settings", raw.settings);
  const pages = parseDocument(Pages, "pages", raw.pages);
  const gradeScales = parseDocument(GradeScales, "gradeScales", raw.gradeScales);
  const programmes = parseDocument(Programmes, "programmes", raw.programmes);
  const students = parseDocument(Students, "students", raw.students);
  const testimonials = parseDocument(Testimonials, "testimonials", raw.testimonials);
  const packages = parseDocument(Packages, "packages", raw.packages);
  const courseGroups = parseDocument(CourseGroups, "courseGroups", raw.courseGroups);
  const faqs = parseDocument(Faqs, "faqs", raw.faqs);
  const schools = parseDocument(Schools, "schools", raw.schools);
  const iaCourse = parseDocument(IaCourse, "iaCourse", raw.iaCourse);
  const whatsappPrefills = parseDocument(WhatsappPrefills, "whatsappPrefills", raw.whatsappPrefills);

  const tokens = buildTokenMap(settings, {
    now: options.now,
    extra: contentCounts({
      programmes,
      students,
      testimonials,
      packages,
      courseGroups,
      faqs,
      schools,
      iaCourse,
    }),
  });

  const content: Omit<SiteContent, "tokens"> = {
    settings: interpolateDeep(settings, tokens, "settings"),
    pages: interpolateDeep(pages, tokens, "pages"),
    gradeScales,
    programmes,
    students,
    testimonials: interpolateDeep(testimonials, tokens, "testimonials"),
    packages: interpolateDeep(packages, tokens, "packages"),
    courseGroups,
    faqs: interpolateDeep(faqs, tokens, "faqs"),
    schools,
    iaCourse: interpolateDeep(iaCourse, tokens, "iaCourse"),
    whatsappPrefills: interpolateDeep(whatsappPrefills, tokens, "whatsappPrefills"),
  };

  const problems = crossCheck(content);
  if (problems.length > 0) {
    throw new ContentError("Content is internally inconsistent.", problems);
  }

  return { ...content, tokens };
}

/* ────────────────────────── server-side loading ────────────────────────── */

// Read through indirect specifiers so a client bundle never tries to resolve
// Node built-ins: `/preview` imports `parseContent` from this module, and only
// `loadContent` ever touches the filesystem.
const NODE_FS = "node:fs/promises";
const NODE_PATH = "node:path";

async function readContentDirectory(): Promise<RawContentFiles> {
  if (typeof window !== "undefined") {
    throw new ContentError("loadContent() reads the filesystem and can only run on the server.");
  }

  const fs = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ NODE_FS)) as typeof import("node:fs/promises");
  const path = (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ NODE_PATH)) as typeof import("node:path");

  const directory = path.join(process.cwd(), "src", "content");
  const entries: Partial<Record<ContentDocumentKey, unknown>> = {};
  const missing: string[] = [];

  await Promise.all(
    CONTENT_DOCUMENT_KEYS.map(async (key) => {
      const file = CONTENT_DOCUMENTS[key].file;
      let text: string;
      try {
        text = await fs.readFile(path.join(directory, file), "utf8");
      } catch {
        missing.push(`${file} (${CONTENT_DOCUMENTS[key].title})`);
        return;
      }
      try {
        entries[key] = JSON.parse(text) as unknown;
      } catch (error) {
        throw new ContentError(
          `${file} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }),
  );

  if (missing.length > 0) {
    throw new ContentError(
      `Content is not migrated yet — these files are missing from ${directory}.`,
      missing.sort(),
    );
  }

  return entries as RawContentFiles;
}

/**
 * Read `src/content/*.json`, validate it and resolve every token.
 * Cached per request, so the page boundary can call it once and pass props down.
 */
export const loadContent = cache(async (): Promise<SiteContent> => {
  return parseContent(await readContentDirectory());
});
