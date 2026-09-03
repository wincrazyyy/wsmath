/**
 * Layer 2 — Collections (docs/02 §3).
 *
 * Entity tables with stable ids. Every item gets an `id` at creation and keeps
 * it forever: asset filenames, editor deep links and cross-references all key
 * off it, never off array position. Every collection supports reorder / add /
 * remove without the site breaking.
 */
import { z } from "zod";

import {
  CtaKey,
  decimal,
  field,
  flag,
  integer,
  longText,
  markdown,
  media,
  MediaRef,
  order,
  stableId,
  text,
  textItem,
} from "./media";

/* ─────────────────────────── gradeScales ─────────────────────────── */

export const GradeBand = z
  .strictObject({
    value: text(
      "Recorded grade",
      "Exactly as it is written on the record, e.g. 7, A*, or B(7). Student results are matched against this, letter for letter.",
    ),
    label: text("Short label", "How it prints on the rail, e.g. B. Usually the grade without the bracketed number."),
    order: order(
      "Rung",
      "Position on the scale, counting up from the lowest grade at 0. One rung = one grade step.",
    ),
  })
  .meta({ id: "GradeBand", title: "Grade band" });

export const GradeScale = z
  .strictObject({
    id: stableId("Scale ID", "Permanent identifier, e.g. ibdp, alevel, igcse. Programmes point at it."),
    name: text("Scale name", "What this scale is called, e.g. IBDP 1–7."),
    railOffset: field(z.number().int().min(0), {
      title: "Rail offset",
      description:
        "How many empty rungs sit below this scale on the shared 9-rung rail. Nine minus the number of bands, so the top grade of every scale lines up: IBDP and A-Level use 2, IGCSE uses 0.",
      widget: "number",
    }),
    bands: field(z.array(GradeBand).min(2), {
      title: "Grades",
      description: "Lowest grade first, highest last. Add, remove or reorder — the rail redraws itself.",
      widget: "collection",
    }),
  })
  .meta({ id: "GradeScale", title: "Grade scale" });

export const GradeScales = z.array(GradeScale).min(1);

/* ─────────────────────────── programmes ─────────────────────────── */

export const PROGRAMME_FAMILIES = ["IBDP", "A-Level / IAL", "IGCSE"] as const;

export const Programme = z
  .strictObject({
    id: stableId("Programme ID", "Permanent identifier, e.g. ibdp-hl. Student records point at it."),
    family: field(z.enum(PROGRAMME_FAMILIES), {
      title: "Curriculum",
      description: "Which curriculum this programme belongs to.",
      widget: "select",
    }),
    label: text("Programme name", "Full name used in the matrix, e.g. IBDP · HL."),
    fullLabel: text(
      "Programme name in full",
      "Name including every detail, e.g. IBDP · HL / AAHL / AIHL. Used where there is room for it.",
    ),
    tabLabel: text("Folder tab label", "Short name on the ledger tab, e.g. A-L Further Math. Keep it short — space is tight."),
    sub: text(
      "Specification line",
      "The exam-board codes this programme covers, e.g. IAL YFM01 / GCE AL 9FM0 / CAIE 9231 / AQA 7367. Transcribe these exactly — a wrong code is a wrong claim.",
    ),
    gradeScaleId: stableId("Grade scale", "The ID of the grade scale this programme is marked on, e.g. ibdp."),
    order: order("Order", "Position in the matrix and the ledger tabs. Lowest shows first."),
    totalCount: integer(
      "Total students in this group",
      "Digits only, e.g. 31. The full count including students not published by name. Drives the n = figure.",
    ),
  })
  .meta({ id: "Programme", title: "Programme" });

export const Programmes = z.array(Programme).min(1);

/* ─────────────────────────── students ─────────────────────────── */

export const StudentResult = z
  .strictObject({
    programmeId: stableId("Programme", "The ID of the programme this result belongs to, e.g. ibdp-hl."),
    gradeFrom: text(
      "Starting grade",
      "School predicted grade or mock, exactly as recorded, e.g. 3 or B(7). Must match a grade on the programme's scale.",
    ),
    gradeTo: text("Final grade", "Final exam result, exactly as recorded, e.g. 7 or A*(9)."),
    months: decimal(
      "Months of coaching",
      "How long it took, e.g. 3. May be a half, e.g. 1.5. Leave blank if it was not recorded.",
    ).optional(),
    published: flag(
      "Publish by name",
      "On: this record shows in the ledger and the matrix with the student's name. Off: it still counts toward the group total but is never named.",
    ),
    predicted: flag(
      "Predicted result",
      "On: the final grade is a forecast, not a confirmed result. It is labelled 'predicted' wherever it appears.",
    ),
  })
  .meta({ id: "StudentResult", title: "Result" });

export const Student = z
  .strictObject({
    id: stableId("Student ID", "Permanent identifier, e.g. james-chow-2024. Testimonials point at it."),
    name: text("Name", "As it should be published, e.g. James Chow."),
    cohortYear: integer("Exam year", "Four digits, e.g. 2024."),
    results: field(z.array(StudentResult).min(1), {
      title: "Results",
      description: "One row per programme. A student who took two programmes has two rows here, not two records.",
      widget: "collection",
    }),
  })
  .meta({ id: "Student", title: "Student" });

export const Students = z.array(Student);

/* ─────────────────────────── testimonials ─────────────────────────── */

export const TESTIMONIAL_LANGS = ["en", "zh-Hant", "zh-Hans", "yue"] as const;
export const TESTIMONIAL_PLACEMENTS = ["featured", "carousel"] as const;

export const Testimonial = z
  .strictObject({
    id: stableId("Testimonial ID", "Permanent identifier, e.g. alice-gao-2022."),
    studentId: stableId(
      "Linked student",
      "Optional. The ID of the student record this quote belongs to, so the grades stay in step with the results table.",
    ).optional(),
    displayName: text("Name shown", "e.g. Alice Gao. The year is added automatically from the field below."),
    cohortYear: integer("Exam year", "Four digits, e.g. 2022. Shown in brackets after the name."),
    programmeLabel: text("Programme", "As it should read on the quote, e.g. IBDP AAHL."),
    gradeFrom: text("Starting grade", "e.g. 6. Shown on the left of the arrow."),
    gradeTo: text("Final grade", "e.g. 7. Shown on the right of the arrow."),
    gradePrefix: text(
      "Grade word",
      "Optional. A word placed before the starting grade in the written credential line only, e.g. " +
        "“Level ” to read “From Level 6 to 7”. The arrow chip and the results table are unaffected. " +
        "Carried so the published line stays byte-identical to the legacy site, which wrote “Level” " +
        "for this one quote and bare numerals for every other.",
    ).optional(),
    months: decimal("Months of coaching", "Optional. e.g. 7. May be a half, e.g. 1.5.").optional(),
    university: text(
      "University",
      "Optional. University name shown separately (no brackets), e.g. “The University of Hong Kong”.",
    ).optional(),
    quote: longText("Quote", "Full testimonial text, exactly as written. Never shortened on the page."),
    lang: field(z.enum(TESTIMONIAL_LANGS), {
      title: "Language",
      description:
        "The language the quote is written in. Screen readers use this to pronounce it correctly — a Chinese quote marked English is read with an English voice.",
      widget: "select",
    }),
    avatar: field(MediaRef.nullable(), {
      title: "Photo",
      description:
        "Leave empty when the student's photo is withheld. The page then shows their grade improvement instead — never a grey silhouette.",
      widget: "image",
    }),
    placement: field(z.enum(TESTIMONIAL_PLACEMENTS), {
      title: "Where it shows",
      description: "Featured: one of the large quotes. Carousel: in the scrolling row underneath.",
      widget: "select",
    }),
    order: order("Order", "Position within its placement."),
  })
  .meta({ id: "Testimonial", title: "Testimonial" });

export const Testimonials = z.array(Testimonial);

/* ─────────────────────────── packages ─────────────────────────── */

/**
 * Two live kinds, both rendered. `'group'` named exactly one package — the
 * retired Mastery System — and `'ia'` was declared and never used; the Maths IA
 * course is its own document (`IaCourse`), not a package.
 */
export const PACKAGE_KINDS = ["private", "board"] as const;

/** How a course reaches the student. Drives the badge on its ledger row. */
export const COURSE_DELIVERIES = ["live", "video"] as const;

/**
 * Which of the two board price tiers a course sells at.
 *
 * `variant.price` is display copy — a token string the card prints verbatim —
 * so nothing downstream can read a NUMBER out of it, and `json-ld.tsx` was
 * therefore publishing the same `lowPrice`/`highPrice` pair for every board.
 * The IAL board sells one course at one price and was shipping an
 * `AggregateOffer` whose upper bound existed nowhere in the source document.
 * This field is the numeric basis: it names the settings figure, so no price is
 * retyped, and `crossCheck` asserts the printed string quotes the tier it
 * claims — one fact, two consumers, unable to drift.
 */
export const COURSE_TIERS = ["standard", "higher"] as const;

export const PackagePrice = z
  .strictObject({
    now: text("Price", "What it costs, e.g. {{money pricing.coursePrice}}.", { tokens: true }),
    was: text("Was", "Optional. The struck-through original, e.g. was {{money pricing.courseListPrice}}.", {
      tokens: true,
    }).optional(),
    per: text("Unit", "What the price buys, e.g. / 90 min · typical rate.", { tokens: true }),
  })
  .meta({ id: "PackagePrice", title: "Price" });

/**
 * One sellable course inside a board package — AASL, 0607, 4MA1 and so on.
 *
 * The outline viewer's pages come from `variants[].outlinePage`, in order, so a
 * board can never have four outline pages and three courses. Asset filenames
 * are keyed off `id`, never off array position.
 */
export const CourseVariant = z
  .strictObject({
    id: stableId(
      "Course ID",
      "Permanent identifier, e.g. aasl, 0607, 4ma1. The outline image file is named after it.",
    ),
    code: text(
      "Exam-board code",
      "Optional. The bare code shown in the left column, e.g. AASL, 0607, 4MA1.",
    ).optional(),
    courseId: stableId(
      "Row in Courses covered",
      "Optional. The ID of the matching course in the Course groups document, e.g. cambridge-international-math-0607. " +
        "That row gets the diamond marking it as a scheduled group course.",
    ).optional(),
    title: text("Course name", "As it should read on the card, e.g. Math Analysis and Approaches SL."),
    delivery: field(z.enum(COURSE_DELIVERIES), {
      title: "How it runs",
      description: "Live: scheduled Zoom lessons. Video: self-paced recordings. Drives the badge on the row.",
      widget: "select",
    }),
    meta: text(
      "Schedule line",
      "The line under the course name, e.g. Sundays 10:00–10:50 · {{programme.ibdpLessonCount}} live {{setup.platform}} lessons.",
      { tokens: true },
    ),
    price: text("Price", "What this course costs, e.g. {{money pricing.coursePrice}}.", { tokens: true }),
    tier: field(z.enum(COURSE_TIERS), {
      title: "Price tier",
      description:
        "Which price in Settings this course sells at — Standard (the usual course price) or Higher " +
        "(the harder courses: AAHL, AIHL, 0606). The row still prints the Price field above; this is " +
        "the figure search engines are given, and the build checks the two agree.",
      widget: "select",
    }),
    badges: field(
      z.array(textItem("Badge", "One short selling point for THIS course only.", { tokens: true })),
      {
        title: "Course badges",
        description:
          "The diamond points on the row — what this course has that its siblings do not. Leave empty to show none.",
        widget: "collection",
      },
    ),
    outlinePage: media(
      "Outline page",
      "This course's page of the outline. File must be named for the Course ID, e.g. /courses/ibdp/aasl.webp.",
    ),
  })
  .meta({ id: "CourseVariant", title: "Course" });

/**
 * The coverage claim a card is entitled to make — the label / value pair the
 * retired courses strip used to carry as a section of its own.
 *
 * It lives on the card rather than in page copy for the same reason `footTag`
 * does: it is a claim about *this* product. Only the private card genuinely
 * covers every course, which is why it is optional.
 */
export const PackageCoverage = z
  .strictObject({
    label: text("Coverage label", "The brass phrase, e.g. Every board covered."),
    value: text(
      "Coverage claim",
      "The claim beside it, e.g. {{content.courseCount}} courses across {{programme.curriculaLabel}}.",
      { tokens: true },
    ),
  })
  .meta({ id: "PackageCoverage", title: "Coverage claim" });

export const CourseOutline = z
  .strictObject({
    label: text("Viewer title", "The title inside the viewer, e.g. IBDP course outline."),
    caption: longText(
      "Caption under the card preview",
      "One line under the outline preview on the card, e.g. Course outline · one page per course. " +
        "Topics, schedule and price for AASL, AAHL, AISL and AIHL.",
      { tokens: true },
    ),
    autoAdvanceSeconds: field(z.number().int().min(2), {
      title: "Seconds per page",
      description: "Digits only, e.g. 6. How often the viewer turns to the next course. Minimum 2.",
      widget: "number",
    }),
  })
  .meta({ id: "CourseOutline", title: "Course outline" });

export const Package = z
  .strictObject({
    id: stableId("Package ID", "Permanent identifier, e.g. private, ibdp."),
    kind: field(z.enum(PACKAGE_KINDS), {
      title: "Type",
      description: "Private 1-to-1 coaching, or a scheduled board course (IBDP, IAL, International GCSE).",
      widget: "select",
    }),
    tag: text("Badge", "Optional. Solid badge at the top of the card, e.g. Most popular.").optional(),
    tagline: text("Second badge", "Optional. Outlined badge, e.g. Customised coaching.").optional(),
    title: text("Title", "Card title, e.g. IBDP Mathematics."),
    price: PackagePrice.optional(),
    description: longText("Description", "Short paragraph under the title.", { tokens: true }),
    bullets: field(z.array(textItem("Bullet", "One selling point.", { tokens: true })).min(1), {
      title: "Bullet points",
      description: "One main benefit per line. Add, remove or reorder freely.",
      widget: "collection",
    }),
    includedTitle: text(
      "Included block title",
      "Optional. Heading of the boxed list, e.g. {{programme.intensiveLessonCount}}-lesson intensive · ~{{money pricing.intensiveBlockCost}}.",
      { tokens: true },
    ).optional(),
    included: field(z.array(textItem("Included item", "One thing included.", { tokens: true })), {
      title: "What is included",
      description: "One line per benefit (priority correspondence, IA support, etc.). Leave empty to hide the box.",
      widget: "collection",
    }),
    coverage: PackageCoverage.optional(),
    variants: field(z.array(CourseVariant).min(1), {
      title: "Courses in this package",
      description:
        "One per course sold under this heading. Add, remove or reorder — the card rows and the outline pages follow.",
      widget: "collection",
    }).optional(),
    outline: CourseOutline.optional(),
    footTag: text("Card foot tag", "The small caps line in the card's foot, e.g. Live Zoom · Sundays · Replays included."),
    ctaKey: CtaKey,
  })
  .meta({ id: "Package", title: "Package" });

export const Packages = z.array(Package).min(1);

/* ─────────────────────────── courseGroups ─────────────────────────── */

export const Course = z
  .strictObject({
    id: stableId("Course ID", "Permanent identifier, e.g. edexcel-ial-further-math-yfm01."),
    name: text(
      "Course name",
      "As printed on the tab panel, e.g. Edexcel IAL Further Math YFM01. Transcribe exam-board codes exactly — never retype them from memory.",
    ),
    code: text("Exam-board code", "Optional. The bare code on its own, e.g. YFM01.").optional(),
  })
  .meta({ id: "Course", title: "Course" });

export const CourseGroup = z
  .strictObject({
    id: stableId("Group ID", "Permanent identifier, e.g. ibdp-courses."),
    title: text("Tab label", "What the folder tab says, e.g. IBDP Courses. The count is added automatically."),
    capLeft: text("Caption, left", "Mono label above the list, e.g. AA / AI · HL / SL · IA."),
    capRight: text("Caption, right", "Note on the right, e.g. four boards, nine specifications."),
    emphasize: flag(
      "Flagship group",
      "On: this group is highlighted as the priority offer. Only one group should have it on.",
    ),
    order: order("Order", "Left-to-right position of the folder tab."),
    courses: field(z.array(Course).min(1), {
      title: "Courses",
      description: "One course per line (e.g. “Math Analysis and Approaches HL”, “Edexcel IAL Further Math YFM01”). The count on the tab follows this list.",
      widget: "collection",
    }),
  })
  .meta({ id: "CourseGroup", title: "Course group" });

export const CourseGroups = z.array(CourseGroup).min(1);

/* ─────────────────────────── faqs ─────────────────────────── */

export const Faq = z
  .strictObject({
    id: stableId("Question ID", "Permanent identifier, e.g. who-is-wsmath-best-for."),
    question: text("Question", "The question as a parent would ask it."),
    answer: markdown(
      "Answer",
      "The answer. Leave a blank line between paragraphs — the blank line is what splits them on the page.",
      { tokens: true },
    ),
    order: order("Order", "Position in the list."),
  })
  .meta({ id: "Faq", title: "FAQ" });

export const Faqs = z.array(Faq).min(1);

/* ─────────────────────────── schools ─────────────────────────── */

export const School = z
  .strictObject({
    id: stableId("School ID", "Permanent identifier, e.g. diocesan-boys-school."),
    name: text("School name", "One school name, exactly as the school writes it, including punctuation."),
    order: order("Order", "Position in the list."),
  })
  .meta({ id: "School", title: "School" });

export const Schools = z.array(School).min(1);

/* ─────────────────────────── iaCourse ─────────────────────────── */

export const IaTheme = z
  .strictObject({
    id: stableId("Theme ID", "Permanent identifier, e.g. ancient-mathematics."),
    title: text("Theme", "e.g. Ancient Mathematics."),
    description: text("One-line description", "e.g. Modern methods for classic problems."),
  })
  .meta({ id: "IaTheme", title: "IA theme" });

export const IaCourse = z
  .strictObject({
    eyebrow: text("Eyebrow", "Small line above the title, e.g. Supported by a PhD in Pure Mathematics."),
    title: text("Title", "e.g. IBDP Maths IA Instructional Course."),
    description: longText("Description", "Short paragraph under the title.", { tokens: true }),
    featuresLabel: text("Features label", "Mono label above the feature list, e.g. Course features."),
    features: field(z.array(textItem("Feature", "One course feature, e.g. Tailored IA topics.")).min(1), {
      title: "Course features",
      description: "One short feature each.",
      widget: "collection",
    }),
    themesLabel: text("Themes label", "Mono label above the theme list, e.g. Themes."),
    themes: field(z.array(IaTheme).min(1), {
      title: "Themes",
      description: "Edit IA topic directions here — title plus one line of description. Add, remove or reorder.",
      widget: "collection",
    }),
    ctaKey: CtaKey,
  })
  .meta({ id: "IaCourse", title: "Maths IA course" });

/* ─────────────────────────── whatsappPrefills ─────────────────────────── */

const prefill = (where: string) =>
  longText(
    `Message — ${where}`,
    "The message WhatsApp opens with. Write (name?), (school?) and (year?) where the student should fill something in — those show as dashed blanks in the on-page preview.",
    { tokens: true },
  );

export const WhatsappPrefills = z
  .strictObject({
    nav: prefill("top navigation"),
    "about-ribbon": prefill("About ribbon"),
    results: prefill("Results"),
    private: prefill("Private coaching card"),
    ibdp: prefill("IBDP course card"),
    ial: prefill("International A-Level course card"),
    igcse: prefill("International GCSE course card"),
    ia: prefill("Maths IA course"),
    video: prefill("Student video clips"),
    faq: prefill("FAQ"),
    footer: prefill("Footer"),
  })
  .meta({
    id: "WhatsappPrefills",
    title: "WhatsApp messages",
    description:
      "WhatsApp is the only way anyone contacts you from this site. One message per button, so you can tell which part of the page an enquiry came from.",
  });

/* ─────────────────────────── inferred types ─────────────────────────── */

export type GradeBand = z.infer<typeof GradeBand>;
export type GradeScale = z.infer<typeof GradeScale>;
export type Programme = z.infer<typeof Programme>;
export type ProgrammeFamily = (typeof PROGRAMME_FAMILIES)[number];
export type StudentResult = z.infer<typeof StudentResult>;
export type Student = z.infer<typeof Student>;
export type Testimonial = z.infer<typeof Testimonial>;
export type TestimonialLang = (typeof TESTIMONIAL_LANGS)[number];
export type TestimonialPlacement = (typeof TESTIMONIAL_PLACEMENTS)[number];
export type PackagePrice = z.infer<typeof PackagePrice>;
export type CourseVariant = z.infer<typeof CourseVariant>;
export type PackageCoverage = z.infer<typeof PackageCoverage>;
export type CourseDelivery = (typeof COURSE_DELIVERIES)[number];
export type CourseTier = (typeof COURSE_TIERS)[number];
export type CourseOutline = z.infer<typeof CourseOutline>;
export type Package = z.infer<typeof Package>;
export type PackageKind = (typeof PACKAGE_KINDS)[number];
export type Course = z.infer<typeof Course>;
export type CourseGroup = z.infer<typeof CourseGroup>;
export type Faq = z.infer<typeof Faq>;
export type School = z.infer<typeof School>;
export type IaTheme = z.infer<typeof IaTheme>;
export type IaCourse = z.infer<typeof IaCourse>;
export type WhatsappPrefills = z.infer<typeof WhatsappPrefills>;
