/**
 * Layer 3 — Page composition, for the v6.3.2 "Movement, Gilded" design.
 *
 * One document holding only section-specific copy plus references into the
 * collections. Nothing here restates a business fact: prices, counts and names
 * arrive as `{{token.path}}` interpolations resolved in `src/lib/tokens.ts`.
 *
 * Every visible text node in the locked v6.3.2 artifact has a home here, in a
 * collection field, or in a settings token. If a string is missing from this
 * document it is because it is derived — the 20,000 in the hero, the matrix
 * counts, the legend percentages.
 */
import { z } from "zod";

import { CtaKey, field, flag, longText, markdown, media, stableId, text, textItem } from "./media";

/* ─────────────────────────── shared shapes ─────────────────────────── */

/** A term/definition pair in a snapshot list or ledger. */
const DefinitionItem = z
  .strictObject({
    id: stableId(),
    dt: text("Label", "The short label, e.g. Consistent progress."),
    dd: text("Value", "The value beside it, e.g. 90%+ improved ≥1 band.", { tokens: true }),
  })
  .meta({ id: "DefinitionItem", title: "Label / value row" });

/** A run of copy where one part is set in bold. */
const EmphasisPart = z
  .strictObject({
    id: stableId(),
    text: text("Text", "One run of the line.", { tokens: true, allowEmpty: true }),
    strong: flag("Bold", "On: this run is set in bold."),
  })
  .meta({ id: "EmphasisPart", title: "Text run" });

const EmphasisLine = z
  .strictObject({
    id: stableId(),
    parts: field(z.array(EmphasisPart).min(1), {
      title: "Line",
      description: "Split the line where the bold starts and stops. Each run is either bold or not.",
      widget: "collection",
    }),
  })
  .meta({ id: "EmphasisLine", title: "Line with bold" });

/** A heading with an optional eyebrow above it and a provenance note beside it. */
const SectionHead = z
  .strictObject({
    eyebrow: text("Eyebrow", "Optional small line above the heading.").optional(),
    title: text("Heading", "The heading itself.", { tokens: true }),
    prov: text(
      "Provenance note",
      "Optional. Small note beside the heading explaining where the numbers come from.",
      { tokens: true },
    ).optional(),
  })
  .meta({ id: "SectionHead", title: "Block heading" });

/* ─────────────────────────── section marks / nav ─────────────────────────── */

const SectionMark = z
  .strictObject({
    id: stableId("Section anchor", "The section this link jumps to, e.g. results."),
    label: text("Menu label", "What the top-bar link says, e.g. Results."),
  })
  .meta({ id: "SectionMark", title: "Menu link" });

const Nav = z
  .strictObject({
    brandLabel: text("Brand label", "The small caps wordmark beside the logo, e.g. WSMath."),
    menuLabel: text("Menu description", "Read out by screen readers for the whole bar, e.g. Primary."),
    ctaLabel: text("Button label", "The brass button in the top bar, e.g. Get in touch."),
    ctaKey: CtaKey,
    skipLabel: text("Skip link", "The keyboard skip link at the very top, e.g. Skip to content."),
  })
  .meta({ title: "Top bar" });

/* ─────────────────────────── hero ─────────────────────────── */

const Hero = z
  .strictObject({
    eyebrow: text("Eyebrow", "The line above the name, e.g. {{brand.taglineEn}}.", { tokens: true }),
    place: text("Location line", "Under the eyebrow, e.g. {{contact.timezoneLabel}}.", { tokens: true }),
    nameLine1: text("Name, first line", "e.g. Winson. Shown in capitals."),
    nameLine2: text("Name, second line", "e.g. Siu. Shown in capitals."),
    inscription: text(
      "Chinese inscription",
      "The vertical Chinese line beside the name, e.g. {{brand.taglineZh}}.",
      { tokens: true },
    ),
    portrait: media("Portrait", "Path to the hero image in /public, e.g. /hero.webp. Loaded first, so keep the file small."),
    band: z
      .strictObject({
        statLabel: text("Headline stat label", "e.g. 1-to-1 tutoring hours."),
        statSublabel: text("Headline stat note", "e.g. since {{stats.teachingSinceLabel}}.", { tokens: true }),
        proof: field(z.array(EmphasisLine).min(1), {
          title: "Proof lines",
          description:
            "The credential lines under the headline number. Split each line where the bold starts and stops.",
          widget: "collection",
        }),
      })
      .meta({ title: "Hero band" }),
    scope: text("Scope line", "The small caps curricula line, e.g. {{programme.curriculaDots}}.", { tokens: true }),
    facts: field(z.array(textItem("Fact", "One short fact line, e.g. 93 result records · 30 schools.", { tokens: true })).min(1), {
      title: "Fact lines",
      description: "The short fact lines above the WhatsApp button.",
      widget: "collection",
    }),
    ctaLabel: text("Button label", "The hero WhatsApp button, e.g. Get in touch."),
    ctaKey: CtaKey,
  })
  .meta({ title: "Hero" });

/* ─────────────────────────── about ─────────────────────────── */

const LeadItem = z
  .strictObject({
    id: stableId(),
    lead: text("Bold lead", "Optional. The bold phrase that opens the point, e.g. Diagnostic-first planning:.").optional(),
    text: longText("Point", "The rest of the point.", { tokens: true }),
  })
  .meta({ id: "LeadItem", title: "Point" });

const JourneyItem = z
  .strictObject({
    id: stableId(),
    name: text("Student", "First name as published, e.g. James."),
    year: text("Year", "The exam year, e.g. 2024."),
    course: text("Course", "e.g. IBDP AAHL."),
    from: text("From", "Starting grade, e.g. 1."),
    to: text("To", "Final grade, e.g. 7."),
    duration: text("Duration", "e.g. 2 years."),
  })
  .meta({ id: "JourneyItem", title: "Journey" });

const About = z
  .strictObject({
    eyebrow: text("Eyebrow", "e.g. About WSMath."),
    title: text("Heading", "e.g. Premium Exam Coaching."),
    lede: longText("Lede", "The sentence under the heading.", { tokens: true }),
    whatYouGet: z
      .strictObject({
        title: text("Heading", "e.g. What you get."),
        items: field(z.array(LeadItem).min(1), {
          title: "Points",
          description: "One ruled line each on the paper sheet.",
          widget: "collection",
        }),
      })
      .meta({ title: "What you get" }),
    howITeach: z
      .strictObject({
        title: text("Heading", "e.g. How I teach."),
        items: field(z.array(LeadItem).min(1), {
          title: "Points",
          description: "One ruled line each on the paper sheet.",
          widget: "collection",
        }),
      })
      .meta({ title: "How I teach" }),
    figure: media("Photograph", "The teaching photograph on the raised plate."),
    whoBlock: z
      .strictObject({
        label: text("Label", "The small caps label, e.g. Who I teach."),
        ageLead: text("Age range", "The large serif part, e.g. Ages 15–18."),
        ageRest: text("Beside the ages", "The rest of the line, e.g. students worldwide."),
        rows: field(z.array(DefinitionItem).min(1), {
          title: "Programme rows",
          description: "Label on the left, course codes on the right, e.g. IBDP Math → AAHL, AASL, AIHL, AISL.",
          widget: "collection",
        }),
        chip: text("Setup chip", "The kit line in the rounded chip, e.g. Best setup: {{setup.equipmentList}}.", {
          tokens: true,
        }),
      })
      .meta({ title: "Who I teach" }),
    journeys: z
      .strictObject({
        items: field(z.array(JourneyItem).min(1), {
          title: "Journeys",
          description:
            "The seven short journeys shown as pills under the grid. These restate records from the results section — keep them in step or the two will disagree.",
          widget: "collection",
        }),
      })
      .meta({ title: "Journeys" }),
  })
  .meta({ title: "About" });

/* ─────────────────────────── courses ─────────────────────────── */

const CourseCode = z
  .strictObject({
    id: stableId("Course", "The course this code belongs to — the ID from the Course groups document."),
    code: text("Display code", "The short code shown in the tray, e.g. AAHL or IBMYP."),
  })
  .meta({ id: "CourseCode", title: "Course display code" });

const Courses = z
  .strictObject({
    eyebrow: text("Eyebrow", "e.g. IBDP · A-Level · IGCSE."),
    title: text("Heading", "e.g. Courses covered."),
    sub: longText("Supporting line", "The sentence beside the heading.", { tokens: true }),
    groupMarkLabel: text(
      "Group-course marker",
      "The sentence the diamond beside a course name stands for, e.g. Also sold as a scheduled group course. " +
        "Read out by screen readers on every marked row, and printed once as the legend under the trays.",
    ),
    displayCodes: field(z.array(CourseCode), {
      title: "Display codes",
      description:
        "Short codes for courses that have none in the Course groups document (the IBDP courses and IBMYP). Courses with a real exam-board code show that code automatically.",
      widget: "collection",
    }),
  })
  .meta({ title: "Courses covered" });

/* ─────────────────────────── ribbon ─────────────────────────── */

const Ribbon = z
  .strictObject({
    ariaLabel: text(
      "Landmark name",
      "Never shown. Names the band for screen readers moving between landmarks, e.g. Availability.",
    ),
    title: text("Heading", "The big line in the carmine band.", { tokens: true }),
    body: text("Body", "The line under it.", { tokens: true }),
    waLabel: text("Small label", "The small caps label above the button, e.g. WhatsApp."),
    ctaLabel: text("Button label", "e.g. Get in touch."),
    ctaKey: CtaKey,
  })
  .meta({ title: "Availability ribbon" });

/* ─────────────────────────── results ─────────────────────────── */

const SUMMARY_METRICS = ["topBand", "secondBand", "bigJumps", "anyImprovement"] as const;

const SummaryCard = z
  .strictObject({
    id: stableId(),
    metric: field(z.enum(SUMMARY_METRICS), {
      title: "What it counts",
      description:
        "Top band: finished on the highest grade. Second band: finished on the top two. Big jumps: moved 2 grades or more. Any improvement: moved at least 1.",
      widget: "select",
    }),
    emoji: text("Emoji", "The emoji beside the label, e.g. ⭐."),
    label: text("Card label", "e.g. Final grade =7."),
  })
  .meta({ id: "SummaryCard", title: "Summary card" });

const Results = z
  .strictObject({
    eyebrow: text("Eyebrow", "e.g. Proven Outcomes · Data-Driven Coaching."),
    title: text("Heading", "e.g. Results, with context."),
    sub: longText("Supporting line", "The sentence beside the heading.", { tokens: true }),
    uplift: z
      .strictObject({
        value: text("Headline figure", "e.g. {{outcomes.avgUplift}}.", { tokens: true }),
        note: text("Small caps note", "e.g. {{outcomes.satisfaction}}.", { tokens: true }),
        label: text("Headline label", "e.g. average grade uplift (From PG/mock to final)."),
      })
      .meta({ title: "Outcome snapshot" }),
    snapList: field(z.array(DefinitionItem).min(1), {
      title: "Snapshot rows",
      description: "The label/value wells under the heading.",
      widget: "collection",
    }),
    gradeHead: z
      .strictObject({
        title: text("Heading", "e.g. Grade improvements."),
        sub: text("First line", "e.g. How students move from school predictions to final exam results."),
        scaleLeft: text("Count line", "e.g. {{content.studentRecordCount}} records across {{content.programmeCount}} groups.", {
          tokens: true,
        }),
        scaleRight: text("Published line", "e.g. {{content.publishedRecordCount}} of them are published individually below.", {
          tokens: true,
        }),
      })
      .meta({ title: "Grade improvements heading" }),
    tabsLabel: text("Tab strip description", "Read out before the group tabs, e.g. Result groups."),
    tabsCountLabel: text(
      "Tab count prefix",
      "Printed before each tab's record count, e.g. n = . Keep the trailing space.",
      { allowEmpty: true },
    ),
    stream: z
      .strictObject({
        fromLabel: text("Left gutter caption", "e.g. From PG / mock."),
        toLabel: text("Right gutter caption", "e.g. Final."),
        readLabel: text("Read-out label", "e.g. Drawn records."),
        readIdle: text("Read-out prompt", "e.g. Hover a ribbon to read its record."),
        drawnTemplate: text(
          "Read-out summary",
          "Shown when nothing is hovered. Write {group} for the group name, {n} for its size and {k} for the drawn count, e.g. {group} · n = {n} · {k} published records drawn.",
        ),
      })
      .meta({ title: "The stream" }),
    matrix: z
      .strictObject({
        caption: longText(
          "Table caption",
          "Describes the table for screen readers, e.g. Grade improvements — number of published records in each grade-jump band, by final grade, for the selected course group.",
        ),
        colLabel: text("First column heading", "e.g. Final grade."),
        binLabels: field(
          z.array(textItem("Column heading", "One bin, e.g. 2 grade improvement.")).length(4),
          {
            title: "Column headings",
            description: "Exactly four: 0–1, 2, 3 and 4+ grade improvements, in that order.",
            widget: "collection",
          },
        ),
        readoutLabel: text("Read-out label", "e.g. Published records."),
        readoutIdle: longText("Read-out prompt", "Shown before any cell is chosen.", { tokens: true }),
        readoutIdleStream: longText(
          "Read-out prompt — stream sentence",
          "The second half of the prompt, printed only where the rising stream is on screen. Phones do not draw the stream, so anything referring to it belongs here and not above.",
          { tokens: true },
        ),
        note: text("Helper note", "The small line under the table, e.g. 👆 Hover on each cell to see the students."),
      })
      .meta({ title: "Improvement matrix" }),
    legend: field(z.array(SummaryCard).min(1), {
      title: "Summary counts",
      description: "Each row counts something across the published records. The number and percentage are calculated, never typed.",
      widget: "collection",
    }),
    legendScope: text("Summary scope", "The line under the counts, e.g. Over the {{content.publishedRecordCount}} published records.", {
      tokens: true,
    }),
    chips: field(z.array(textItem("Chip", "One short label chip.")).min(1), {
      title: "Label chips",
      description: "The debossed label chips under the summary counts.",
      widget: "collection",
    }),
    schoolsHead: SectionHead,
    cta: z
      .strictObject({
        title: text("Heading", "e.g. Start your IBDP / A-Level / IGCSE coaching.", { tokens: true }),
        body: text("Body", "The line under the heading.", { tokens: true }),
        rows: field(z.array(textItem("Point", "One benefit per line.", { tokens: true })).min(1), {
          title: "Points",
          description: "Shown as short lines above the WhatsApp button.",
          widget: "collection",
        }),
        prov: text("Note", "Tiny note under the points (e.g. response time / what to send).", { tokens: true }),
        trio: text("Prompt trio", "The small caps prompt beside the button, e.g. (name?) · (school?) · (year?)."),
        art: media("Image", "The image in the small well beside the call to action."),
        ctaLabel: text("Button label", "e.g. Get in touch."),
        ctaKey: CtaKey,
      })
      .meta({ title: "Results call to action" }),
  })
  .meta({ title: "Results" });

/* ─────────────────────────── packages ─────────────────────────── */

const CmpCell = z
  .strictObject({
    id: stableId(),
    label: text("Label", "The small caps label, e.g. Standard 1-to-1 rate."),
    fig: text("Figure", "The large figure, e.g. {{money pricing.ibdpPrivateEquivalent}}.", { tokens: true }),
    sub: text("Small line", "Under the figure, e.g. {{plus programme.ibdpTeachingHours}} hours 1-to-1.", { tokens: true }),
  })
  .meta({ id: "CmpCell", title: "Comparison cell" });

/**
 * The eight labels the course-outline viewer says. Everything else it says is
 * already content: the panel's title is the outline's own `label`, each page is
 * announced by its own alt text, and the page rail is labelled with the courses'
 * own exam-board codes.
 *
 * `openLabel` carries a `{count}` placeholder rather than a token: the number of
 * pages differs per card (IBDP 4, International GCSE 3, IAL 1), so it is
 * substituted by the component from `pages.length`. A token would be one number
 * for every card, which is exactly how the retired `content.leafletPageCount`
 * was wrong by construction.
 */
const OutlineCopy = z
  .strictObject({
    openLabel: text(
      "Open label",
      "Write {count} where the number of pages goes, e.g. View the course outline · {count} pages.",
    ),
    openLabelSingle: text(
      "Open label, one page",
      "Used when an outline has a single page, e.g. View the course outline.",
    ),
    closeLabel: text("Close label", "The button that shuts the viewer, e.g. Close."),
    previousLabel: text("Previous label", "Never shown. Names the back arrow, e.g. Previous course."),
    nextLabel: text("Next label", "Never shown. Names the forward arrow, e.g. Next course."),
    pauseLabel: text("Pause label", "Stops the pages turning on their own, e.g. Pause."),
    playLabel: text("Play label", "Starts them turning again, e.g. Play."),
    fullSizeLabel: text(
      "Full-size label",
      "Shown on the small plate in the corner of the page, e.g. Open at full size.",
    ),
  })
  .meta({ id: "OutlineCopy", title: "Course outline viewer" });

const PackagesPage = z
  .strictObject({
    eyebrow: text("Eyebrow", "e.g. IBDP Coaching Packages."),
    title: text("Heading", "e.g. Choose the path that fits your goal."),
    sub: longText("Supporting line", "The sentence beside the heading.", { tokens: true }),
    chips: field(z.array(textItem("Chip", "One short label chip.")).min(1), {
      title: "Label chips",
      description: "The debossed label chips under the heading.",
      widget: "collection",
    }),
    ledger: z
      .strictObject({
        title: text(
          "Ledger heading",
          "The small caps line above the ledger, e.g. IBDP Mathematics group course.",
          { tokens: true },
        ),
        rows: field(z.array(DefinitionItem).min(1), {
          title: "Ledger rows",
          description: "The valuation ledger, e.g. Was → {{money pricing.courseListPrice}}.",
          widget: "collection",
        }),
      })
      .meta({ title: "Valuation ledger" }),
    snapshot: z
      .strictObject({
        label: text("Small caps label", "e.g. Since {{stats.oneToOneSince}}.", { tokens: true }),
        value: text("Headline figure", "e.g. {{plus stats.studentsCoached}}.", { tokens: true }),
        sub: text("Under the figure", "e.g. students coached 1-on-1."),
      })
      .meta({ title: "Outcome snapshot" }),
    snapList: field(z.array(DefinitionItem).min(1), {
      title: "Snapshot rows",
      description: "The label/value rows under the headline figure.",
      widget: "collection",
    }),
    cmp: z
      .strictObject({
        heading: EmphasisLine,
        cells: field(z.array(CmpCell).min(1), {
          title: "Comparison cells",
          description: "The two wells: standard 1-to-1 cost vs the group course investment.",
          widget: "collection",
        }),
      })
      .meta({ title: "Value comparison" }),
    rateLabel: text("Rate label", "The small caps label before the private price, e.g. Typical rate."),
    /*
     * The two words the delivery badge can say. Keyed by `CourseVariant.delivery`,
     * so adding a delivery mode to the schema forces a label rather than leaving
     * the badge blank — and the words stay editable and readable, which a CSS
     * `content:` string would not be.
     */
    deliveryLabels: z
      .strictObject({
        live: text("Live badge", "The word on a scheduled course's badge, e.g. Live."),
        video: text("Video badge", "The word on a self-paced course's badge, e.g. Video."),
      })
      .meta({ title: "Delivery badges" }),
    outline: OutlineCopy,
    /*
     * The private and board plates take their foot tag from `Package.footTag` —
     * a card's foot line belongs to the card, and the editor should find
     * it there rather than in page copy. `iaFootTag` stays here because the IA
     * block is an `IaCourse`, not a `Package`.
     */
    iaFootTag: text("IA block foot tag", "The small caps line in the IA course's foot."),
    ctaLabel: text("Button label", "The label on the package WhatsApp buttons, e.g. Get in touch."),
    plan: z
      .strictObject({
        label: text("Panel label", "The floating panel's title, e.g. Your plan."),
        pickShow: text("Pick label", "The button before a plan is chosen, e.g. Show in your plan."),
        pickActive: text("Picked label", "The button once the plan is chosen, e.g. In your plan."),
        ctaLabel: text("Panel button label", "The WhatsApp button in the floating panel, e.g. Get in touch."),
        defaultPackageId: stableId(
          "Preselected plan",
          "The ID of the package the floating panel starts on, e.g. ibdp. It must be a package that has a price.",
        ),
      })
      .meta({ title: "Your plan panel" }),
  })
  .meta({ title: "Packages" });

/* ─────────────────────────── voices ─────────────────────────── */

const VIDEO_PROVIDERS = ["loom", "stream", "youtube"] as const;

const VideoClip = z
  .strictObject({
    id: stableId(),
    testimonialId: stableId("Linked testimonial", "Optional. The ID of the testimonial this clip belongs to.").optional(),
    name: text("Name", "e.g. Alice Gao."),
    course: text("Course and year", "e.g. IBDP AAHL · 2022."),
    grade: text("Grade change", "e.g. 6 → 7. Use the arrow, not a hyphen."),
    image: media("Still", "The thumbnail for this clip."),
  })
  .meta({ id: "VideoClip", title: "Video clip" });

const UniversityShortName = z
  .strictObject({
    id: stableId(),
    full: text("Full name", "As written in the testimonial, e.g. The University of Hong Kong."),
    short: text("Short name", "Shown on the small sheets, e.g. HKU."),
  })
  .meta({ id: "UniversityShortName", title: "University short name" });

const Voices = z
  .strictObject({
    eyebrow: text("Eyebrow", "e.g. Student Voices."),
    title: text("Heading", "e.g. What my students and parents say."),
    lede: longText("Supporting line", "The sentence beside the heading.", { tokens: true }),
    video: z
      .strictObject({
        provider: field(z.enum(VIDEO_PROVIDERS), {
          title: "Video host",
          description: "Where the video lives. Paste the normal share link below — the embed link is worked out for you.",
          widget: "select",
        }),
        url: text("Video link", "Paste the share link exactly as the host gives it."),
        stamp: text("Corner stamp", "The small caps line under the player, e.g. Video · replays available."),
        heading: text("Heading beside the video", "e.g. Real students talking about their WSMath journey."),
        body: longText("Body beside the video", "The paragraph under that heading.", { tokens: true }),
        clips: field(z.array(VideoClip).min(1), {
          title: "Clips",
          description: "The students in the video, in order.",
          widget: "collection",
        }),
        ctaKey: CtaKey,
      })
      .meta({ title: "Student video" }),
    trough: z
      .strictObject({
        label: text("Label", "The line above the drifting row, e.g. Twelve more, in four written languages."),
        sheetIds: field(z.array(stableId("Testimonial", "The ID of a testimonial from the Testimonials document.")).min(1), {
          title: "Sheets shown",
          description:
            "Which testimonials drift through the row, in order. Pick from the carousel testimonials — the quotes themselves live in the Testimonials document.",
          widget: "collection",
        }),
        universityShortNames: field(z.array(UniversityShortName), {
          title: "University short names",
          description: "Universities shortened on the small sheets. Any university not listed here is shown in full.",
          widget: "collection",
        }),
        pauseLabel: text("Pause button", "e.g. Pause."),
        playLabel: text("Play button", "e.g. Play."),
      })
      .meta({ title: "The drifting row" }),
  })
  .meta({ title: "Student voices" });

/* ─────────────────────────── faq ─────────────────────────── */

const FaqPage = z
  .strictObject({
    eyebrow: text("Eyebrow", "e.g. Questions answered."),
    title: text("Heading", "e.g. FAQs."),
    sub: longText("Supporting line", "The sentence beside the heading.", { tokens: true }),
    ctaKey: CtaKey,
  })
  .meta({ title: "FAQ" });

/* ─────────────────────────── footer ─────────────────────────── */

const FOOTER_LINK_KINDS = ["anchor", "modal", "whatsapp", "external"] as const;

const FooterLink = z
  .strictObject({
    id: stableId(),
    label: text("Label", "What the link says."),
    kind: field(z.enum(FOOTER_LINK_KINDS), {
      title: "Link type",
      description:
        "Anchor: jumps to a section on this page. Modal: opens the privacy policy. WhatsApp: starts a chat. External: opens another site.",
      widget: "select",
    }),
    href: text(
      "Destination",
      "For an anchor, the section id with a hash, e.g. #packages. For an external link, the full address. Leave blank for modal and WhatsApp.",
    ).optional(),
  })
  .meta({ id: "FooterLink", title: "Footer link" })
  /*
   * `href` is optional because modal and WhatsApp links have no destination —
   * but for an anchor or an external link it is required, and nothing enforced
   * that. The editor renders its form from the schema, so it would present
   * "Link type: Anchor" with a blank optional "Destination" as a valid
   * combination, and the footer would render dead, unclickable, half-transparent
   * text. On a site whose only funnel is its links, that has to fail validation.
   */
  .refine(
    (link) =>
      link.kind === "anchor" || link.kind === "external"
        ? typeof link.href === "string" && link.href.length > 0
        : true,
    { message: "An anchor or external link needs a destination.", path: ["href"] },
  );

const FooterColumn = z
  .strictObject({
    id: stableId(),
    title: text("Column heading", "e.g. Programmes."),
    links: field(z.array(FooterLink).min(1), {
      title: "Links",
      description: "Add, remove or reorder.",
      widget: "collection",
    }),
  })
  .meta({ id: "FooterColumn", title: "Footer column" });

const FooterMeta = z
  .strictObject({
    id: stableId(),
    label: text("Label", "e.g. Time zone:."),
    value: text("Value", "e.g. Hong Kong / Global online.", { tokens: true }),
  })
  .meta({ id: "FooterMeta", title: "Footer detail" });

const Footer = z
  .strictObject({
    socialsLabel: text("Social links description", "Read out before the icons, e.g. Social."),
    columns: field(z.array(FooterColumn).min(1), {
      title: "Link columns",
      description: "The columns of links in the footer.",
      widget: "collection",
    }),
    getInTouch: z
      .strictObject({
        title: text("Heading", "e.g. Get in touch."),
        body: longText(
          "Body",
          "Short paragraph under the heading. Keep it concise and action-oriented.",
          { tokens: true },
        ),
        ctaLabel: text("Button label", "e.g. Get in touch."),
        ctaKey: CtaKey,
      })
      .meta({ title: "Get in touch" }),
    meta: field(z.array(FooterMeta).min(1), {
      title: "Practical details",
      description: "The lines under the WhatsApp button.",
      widget: "collection",
    }),
    bottom: z
      .strictObject({
        rights: text("Rights line", "e.g. All rights reserved."),
        disclaimer: longText(
          "Disclaimer",
          "Small note after the rights line. Keep it short and professional.",
        ),
      })
      .meta({ title: "Bottom bar" }),
  })
  .meta({ title: "Footer" });

/* ─────────────────────────── legal ─────────────────────────── */

const PrivacySection = z
  .strictObject({
    id: stableId(),
    heading: text("Heading", "e.g. What we collect."),
    body: markdown("Body", "The paragraph. Leave a blank line between paragraphs."),
  })
  .meta({ id: "PrivacySection", title: "Privacy section" });

const Legal = z
  .strictObject({
    privacy: z
      .strictObject({
        modalTitle: text("Title", "Shown at the top of the privacy panel, e.g. Privacy Policy."),
        lastUpdatedLabel: text("Last-updated label", "e.g. Last updated:."),
        lastUpdated: field(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD, e.g. 2026-07-28."), {
          title: "Last updated",
          description: "The date the policy last changed, as YYYY-MM-DD.",
          widget: "text",
        }),
        intro: longText("Intro", "The paragraph before the sections."),
        sections: field(z.array(PrivacySection).min(1), {
          title: "Sections",
          description: "Add, remove or reorder.",
          widget: "collection",
        }),
        footerHintPrefix: text("Close hint, before the key", "e.g. Click outside or press."),
        footerHintKey: text("Close hint, the key", "e.g. Esc."),
        footerHintSuffix: text("Close hint, after the key", "e.g. to close."),
        closeButton: text("Close button", "e.g. Close."),
      })
      .meta({ title: "Privacy policy" }),
  })
  .meta({ title: "Legal" });

/* ─────────────────────────── the document ─────────────────────────── */

export const Pages = z
  .strictObject({
    sectionMarks: field(z.array(SectionMark).min(1), {
      title: "Menu links",
      description: "The top-bar links, in order. Each points at a section of the page.",
      widget: "collection",
    }),
    nav: Nav,
    hero: Hero,
    about: About,
    courses: Courses,
    ribbon: Ribbon,
    packagesPage: PackagesPage,
    results: Results,
    voices: Voices,
    faqPage: FaqPage,
    footer: Footer,
    legal: Legal,
  })
  .meta({
    id: "Pages",
    title: "Page copy",
    description:
      "The wording of each section. Numbers, prices and names come from Settings — write {{token.path}} rather than typing them again.",
  });

export type Pages = z.infer<typeof Pages>;
export type SectionMark = z.infer<typeof SectionMark>;
export type Nav = z.infer<typeof Nav>;
export type Hero = z.infer<typeof Hero>;
export type EmphasisLine = z.infer<typeof EmphasisLine>;
export type EmphasisPart = z.infer<typeof EmphasisPart>;
export type About = z.infer<typeof About>;
export type LeadItem = z.infer<typeof LeadItem>;
export type JourneyItem = z.infer<typeof JourneyItem>;
export type Courses = z.infer<typeof Courses>;
export type CourseCode = z.infer<typeof CourseCode>;
export type Ribbon = z.infer<typeof Ribbon>;
export type SectionHead = z.infer<typeof SectionHead>;
export type DefinitionItem = z.infer<typeof DefinitionItem>;
export type Results = z.infer<typeof Results>;
export type SummaryCard = z.infer<typeof SummaryCard>;
export type SummaryMetric = (typeof SUMMARY_METRICS)[number];
export type PackagesPage = z.infer<typeof PackagesPage>;
export type OutlineCopy = z.infer<typeof OutlineCopy>;
export type CmpCell = z.infer<typeof CmpCell>;
export type Voices = z.infer<typeof Voices>;
export type VideoClip = z.infer<typeof VideoClip>;
export type UniversityShortName = z.infer<typeof UniversityShortName>;
export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];
export type FaqPage = z.infer<typeof FaqPage>;
export type Footer = z.infer<typeof Footer>;
export type FooterColumn = z.infer<typeof FooterColumn>;
export type FooterLink = z.infer<typeof FooterLink>;
export type FooterLinkKind = (typeof FOOTER_LINK_KINDS)[number];
export type FooterMeta = z.infer<typeof FooterMeta>;
export type Legal = z.infer<typeof Legal>;
export type PrivacySection = z.infer<typeof PrivacySection>;

export {
  SUMMARY_METRICS,
  VIDEO_PROVIDERS,
  FOOTER_LINK_KINDS,
  SectionMark as SectionMarkSchema,
  DefinitionItem as DefinitionItemSchema,
  EmphasisLine as EmphasisLineSchema,
  SectionHead as SectionHeadSchema,
  LeadItem as LeadItemSchema,
  JourneyItem as JourneyItemSchema,
  CourseCode as CourseCodeSchema,
  SummaryCard as SummaryCardSchema,
  CmpCell as CmpCellSchema,
  VideoClip as VideoClipSchema,
  UniversityShortName as UniversityShortNameSchema,
  FooterLink as FooterLinkSchema,
  FooterColumn as FooterColumnSchema,
  FooterMeta as FooterMetaSchema,
  PrivacySection as PrivacySectionSchema,
};
