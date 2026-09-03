/**
 * Layer 1 — Settings and tokens (docs/02 §2).
 *
 * One document. Every value here is referenced from many places on the page and
 * must never be retyped: copy interpolates `{{token.path}}` instead. This layer
 * is the direct answer to the owner's request to "have some fields register
 * against all places, for example x hours".
 *
 * Derived values (years of experience, the group saving, the per-lesson rate)
 * are NOT stored — they are computed in `src/lib/tokens.ts` from these fields.
 */
import { z } from "zod";

import {
  externalUrl,
  field,
  integer,
  longText,
  media,
  stableId,
  text,
} from "./media";

export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "xiaohongshu",
  "youtube",
  "tiktok",
  "wechat",
] as const;

export const SocialLink = z
  .strictObject({
    platform: field(z.enum(SOCIAL_PLATFORMS), {
      title: "Platform",
      description: "Which network this link points at. Drives the icon.",
      widget: "select",
    }),
    url: externalUrl("Profile URL", "Full link to the profile or page, including https://."),
  })
  .meta({ id: "SocialLink", title: "Social profile" });

export const NavSection = z
  .strictObject({
    id: stableId(
      "Section anchor",
      "The id of the section this links to, e.g. about. Must match a section on the page.",
    ),
    label: text("Menu label", "What the navigation shows, e.g. About. The 01/02/03 number is added automatically."),
  })
  .meta({ id: "NavSection", title: "Navigation entry" });

export const Settings = z
  .strictObject({
    brand: z
      .strictObject({
        name: text("Brand name", "The business name, e.g. WSMath."),
        copyrightHolder: text(
          "Copyright holder",
          "The name on the © line in the footer, e.g. Winson Siu. Kept separate from the brand name " +
            "because a rights notice names a legal person, not a trading name. docs/07-content-conflicts.md " +
            "has this open with the owner.",
        ),
        tutorName: text("Tutor name", "Full name as it should appear everywhere, e.g. Winson Siu."),
        tutorNameZh: text("Tutor name (Chinese)", "Chinese name or title, e.g. 數學軍師."),
        taglineEn: text("Tagline (English)", "One line describing what you do, e.g. International Mathematics Exam Strategist."),
        taglineZh: text("Tagline (Chinese)", "The same line in Chinese, e.g. 國際數學科考試軍師."),
        description: longText(
          "Short description",
          "One sentence used in the footer and in search results, e.g. Structured learning, exam strategy, measurable progress.",
        ),
        logo: media("Logo", "The square mark shown in the footer, e.g. /icon.png."),
        ogImage: media("Share image", "Shown when a link to the site is pasted into WhatsApp or a social post. 1200×630 works best."),
      })
      .meta({ title: "Brand", description: "Names and marks. Changing these changes them everywhere." }),

    contact: z
      .strictObject({
        whatsappPhone: field(
          z.string().regex(/^\d{8,15}$/, "Digits only, no plus sign and no spaces."),
          {
            title: "WhatsApp number",
            description:
              "Digits only, including the country code and no + sign, e.g. 85269447214. Used to build every wa.me link on the site.",
            widget: "phone",
          },
        ),
        timezoneLabel: text("Time zone", "Shown in the footer, e.g. Hong Kong / Global online."),
        centreAddress: text(
          "Centre address",
          "Where face-to-face lessons happen, e.g. Times Square, Causeway Bay. Also used by search engines.",
        ),
      })
      .meta({ title: "Contact" }),

    socials: field(z.array(SocialLink), {
      title: "Social profiles",
      description: "Add, remove or reorder. Each one shows as an icon in the footer.",
      widget: "collection",
    }),

    stats: z
      .strictObject({
        tutoringHours: integer("1-to-1 tutoring hours", "Digits only, e.g. 20000. The + and the comma are added automatically."),
        studentsCoached: integer("Students coached", "Digits only, e.g. 250."),
        lessonsTaught: integer("Lessons taught", "Digits only, e.g. 11000."),
        teachingSince: field(
          z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM, e.g. 2017-09."),
          {
            title: "Teaching since",
            description:
              "Year and month you started, as YYYY-MM, e.g. 2017-09. Years of experience is calculated from this, so it can never go stale.",
            widget: "text",
          },
        ),
        oneToOneSince: integer(
          "1-to-1 engagements since",
          "Year the 1-to-1 practice started, e.g. 2018. Distinct from 'Teaching since' — the packages " +
            "snapshot quotes this one. docs/07-content-conflicts.md §A2 has the two dates open with the owner; " +
            "until they are reconciled both are editable here rather than typed into copy.",
        ),
        iaStudents: integer("Maths IA students supported", "Digits only, e.g. 80."),
        iaYearRange: text("Maths IA years", "The span those IA students cover, e.g. 2020–2025."),
        questionBankYears: text("Question bank years", "The span the past-paper bank covers, e.g. 2008–2025."),
        pastPapersIbdp: text(
          "IBDP past-paper years",
          "The span of past papers in the IBDP courses, e.g. 2008–2026. Shown on every IBDP course row.",
        ),
        pastPapersIal: text(
          "International A-Level past-paper years",
          "The span of past papers in the IAL course, e.g. 2014–2026.",
        ),
        pastPapersCambridgeIgcse: text(
          "Cambridge IGCSE past-paper years",
          "The span of past papers in the 0607 and 0606 courses, e.g. 2014–2026.",
        ),
        pastPapersEdexcelIgcse: text(
          "Edexcel International GCSE past-paper years",
          "The span of past papers in the 4MA1 course, e.g. 2018–2025.",
        ),
      })
      .meta({
        title: "Headline numbers",
        description: "Edit once here. Every sentence on the site that mentions these numbers updates with it.",
      }),

    pricing: z
      .strictObject({
        currency: field(z.literal("HKD"), {
          title: "Currency",
          description: "Currency code shown before every price.",
          widget: "text",
        }),
        locale: field(z.string().default("en-HK"), {
          title: "Number format",
          description:
            "Locale used to group digits, e.g. en-HK gives 19,800. Pinned so every visitor sees the same figure.",
          widget: "text",
        }),
        privateHourlyRate: integer("1-to-1 hourly rate", "Digits only, e.g. 1500. Will be parsed as a number."),
        coursePrice: integer(
          "Course price",
          "Digits only, e.g. 16800. What most board courses cost — AASL, AISL, the IAL course, 0607 and 4MA1. " +
            "The headline figure on the cards and the one the value comparison uses.",
        ),
        coursePriceHigher: integer(
          "Course price, higher tier",
          "Digits only, e.g. 19800. What the harder courses cost — AAHL, AIHL and 0606.",
        ),
        courseListPrice: integer(
          "Course list price",
          "Digits only, e.g. 60000. The undiscounted price, shown struck through above the real one. " +
            "The saving and the discount percentage are calculated from it.",
        ),
        referralRebateMax: integer("Maximum referral rebate", "Digits only, e.g. 3000."),
      })
      .meta({
        title: "Prices",
        description:
          "Every price on the page comes from here. The savings, the per-lesson rate and the comparison bars are all calculated from the figures here.",
      }),

    programme: z
      .strictObject({
        sessionMinutes: integer(
          "1-to-1 lesson length (minutes)",
          "Digits only, e.g. 90. Used to convert 1-to-1 lessons into hours.",
        ),
        courseSessionMinutes: integer(
          "Group lesson length (minutes)",
          "Digits only, e.g. 50. How long one live group lesson runs. Used to turn lesson counts into teaching hours, " +
            "so the 1-to-1 comparison compares like with like.",
        ),
        ibdpLessonCount: integer(
          "Lessons in an IBDP course",
          "Digits only, e.g. 28. Applies to all four IBDP courses. The per-lesson rate and the value comparison use it.",
        ),
        ialLessonCount: integer("Lessons in the International A-Level course", "Digits only, e.g. 32."),
        edexcelIgcseLessonCount: integer(
          "Lessons in the Edexcel International GCSE course",
          "Digits only, e.g. 24. This is the 4MA1 course only — 0607 and 0606 are video courses with no live lessons.",
        ),
        ibdpBonusVideoHoursStandard: integer(
          "Bonus video hours, IBDP SL",
          "Digits only, e.g. 32. Teaching video given on top of the live lessons in AASL and AISL.",
        ),
        ibdpBonusVideoHoursAdvanced: integer(
          "Bonus video hours, IBDP HL",
          "Digits only, e.g. 64. Teaching video given on top of the live lessons in AAHL and AIHL.",
        ),
        videoHours0607: integer(
          "Length of the 0607 video course (hours)",
          "Digits only, e.g. 32. 0607 is a video course, so this is the whole product. " +
            "The 0606 card also quotes it, because 0606 bundles these videos in.",
        ),
        videoHours0606: integer(
          "Length of the 0606 video course (hours)",
          "Digits only, e.g. 32. 0606's own teaching video, separate from the 0607 videos it bundles.",
        ),
        intensiveLessonCount: integer("Lessons in the intensive block", "Digits only, e.g. 8. Used to compute the block cost."),
        curricula: field(z.array(text("Curriculum", "One curriculum, e.g. IBDP.")).min(1), {
          title: "Curricula taught",
          description: "One per line, e.g. IBDP, A-Level / IAL, IGCSE. Every sentence listing them is built from this.",
          widget: "collection",
        }),
      })
      .meta({
        title: "Programme shape",
        description: "Lesson counts and lengths. Every sentence on the site that quotes one is built from these.",
      }),

    setup: z
      .strictObject({
        platform: text("Lesson platform", "Where live lessons happen, e.g. Zoom."),
        equipment: field(z.array(text("Item", "One piece of kit, e.g. iPad.")).min(1), {
          title: "Recommended equipment",
          description: "One item per line, e.g. iPad, Apple Pencil, GoodNotes. Joined with + wherever the kit is listed.",
          widget: "collection",
        }),
      })
      .meta({ title: "Lesson setup" }),

    outcomes: z
      .strictObject({
        hlSixPlusRate: text("Math HL 6+ rate", "As you want it written, e.g. 65%+."),
        slSixPlusRate: text("Math SL 6+ rate", "As you want it written, e.g. 65%+."),
        avgUplift: text("Average grade uplift", "As you want it written, e.g. 2+."),
        improvedOneBand: text("Improved at least one band", "As you want it written, e.g. 90%+ improved ≥1 band."),
        typicalTimeToGain: text("Typical time to first gain", "As you want it written, e.g. Often within 8–12 weeks."),
        satisfaction: text("Satisfaction", "As you want it written, e.g. Very high satisfaction."),
        topBandsLabel: text("Top bands", "How the top outcomes read, e.g. 6–7 / A–A* outcomes."),
      })
      .meta({
        title: "Outcome claims",
        description: "Marketing claims shown in the results snapshot. Keep them true — they are the strongest thing on the page.",
      }),

    seo: z
      .strictObject({
        siteUrl: externalUrl("Site address", "The live address, e.g. https://wsmath.com. No trailing slash."),
        title: text("Page title", "Shown in the browser tab and as the headline in search results."),
        description: longText("Search description", "One or two sentences shown under the title in search results."),
      })
      .meta({ title: "Search and sharing" }),

    builder: z
      .strictObject({
        label: text("Credit prefix", "Text before the name, e.g. Built by."),
        name: text("Builder name", "Who built the site, e.g. XiniDev."),
        siteUrl: externalUrl("Builder site", "Link on the builder credit."),
        githubUrl: externalUrl("Builder GitHub", "Optional. Second link on the builder credit, e.g. a GitHub profile.").optional(),
        stack: text("Stack", "What it is built with, shown after the name, e.g. Next.js + Tailwind."),
      })
      .meta({ title: "Builder credit" }),

    navSections: field(z.array(NavSection).min(1), {
      title: "Navigation",
      description:
        "The links in the top bar, in order. Each one jumps to a section; the 01/02/03 numbering follows the order automatically.",
      widget: "collection",
    }),
  })
  .meta({
    id: "Settings",
    title: "Settings",
    description:
      "Business facts referenced across the whole site. Change a number here and every sentence that mentions it changes with it.",
  });

export type Settings = z.infer<typeof Settings>;
export type SocialLink = z.infer<typeof SocialLink>;
export type NavSection = z.infer<typeof NavSection>;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
