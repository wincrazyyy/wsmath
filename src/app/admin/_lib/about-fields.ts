// app/admin/_lib/about-fields.ts
import type { FieldConfig } from "./fields";

// Header (SectionHeader)
export const ABOUT_HEADER_FIELDS: FieldConfig[] = [
  {
    path: "header.eyebrow",
    label: "Header eyebrow",
    description: "Small label above the About heading, e.g. “ABOUT WSMATH”.",
    type: "string",
  },
  {
    path: "header.title",
    label: "Header title",
    description: "Main About title.",
    type: "string",
  },
  {
    path: "header.subtitle",
    label: "Header subtitle",
    description: "Short paragraph under the About title.",
    type: "textarea",
  },
  {
    path: "header.chips",
    label: "Header chips (badges)",
    description: "One chip per line shown under the header.",
    type: "string[]",
  },
  {
    path: "header.rightAccent.heading",
    label: "Right accent – heading",
    description: "Top line in the right summary card, e.g. “Who I teach”.",
    type: "string",
  },
  {
    path: "header.rightAccent.badge",
    label: "Right accent – badge",
    description: "Small badge, e.g. “IBDP · A-Level · IGCSE”.",
    type: "string",
  },
  {
    path: "header.rightAccent.mainValue",
    label: "Right accent – main value",
    description: "Big number/text, e.g. “Year 10–13”.",
    type: "string",
  },
  {
    path: "header.rightAccent.mainLabel",
    label: "Right accent – main label",
    description: "Label under the main value, e.g. “students worldwide”.",
    type: "string",
  },
  {
    path: "header.rightAccent.mainSize",
    label: "Right accent – main size",
    description: "Size token (sm or lg). Leave blank for default.",
    type: "string",
  },
  {
    path: "header.rightAccent.columns[0].title",
    label: "Right accent – left column title",
    description: "e.g. “IBDP Math”.",
    type: "string",
  },
  {
    path: "header.rightAccent.columns[0].items",
    label: "Right accent – left column items",
    description: "One line per item (e.g. AAHL, AIHL...).",
    type: "string[]",
  },
  {
    path: "header.rightAccent.columns[1].title",
    label: "Right accent – right column title",
    description: "e.g. “Other programmes”.",
    type: "string",
  },
  {
    path: "header.rightAccent.columns[1].items",
    label: "Right accent – right column items",
    description: "One line per item (e.g. A-Level, IGCSE...).",
    type: "string[]",
  },
];

// Hero image band + cards
export const ABOUT_HERO_FIELDS: FieldConfig[] = [
  {
    path: "hero.imageSrc",
    label: "Hero image path",
    description: "Path to the horizontal image, e.g. /about-hero.png.",
    type: "string",
  },
  {
    path: "hero.eyebrow",
    label: "Hero image eyebrow",
    description: "Small label on the image ribbon, e.g. your name + title.",
    type: "string",
  },
  {
    path: "hero.area1.title",
    label: "Left card title",
    description: "Title for the left card above the image.",
    type: "string",
  },
  {
    path: "hero.area1.items",
    label: "Left card bullets",
    description: "One bullet per line for the left card.",
    type: "string[]",
  },
  {
    path: "hero.area2.title",
    label: "Right card title",
    description: "Title for the right card above the image.",
    type: "string",
  },
  {
    path: "hero.area2.items",
    label: "Right card bullets",
    description: "One bullet per line for the right card.",
    type: "string[]",
  },
];

// Stats + Courses
export const ABOUT_STATS_COURSES_FIELDS: FieldConfig[] = [
  {
    path: "stats",
    label: "Stats / credibility chips",
    description: "One stat per line shown as pills under the image.",
    type: "string[]",
  },
  {
    path: "courses",
    label: "Courses covered",
    description: "One course per line. Feeds the CoursesCovered component.",
    type: "string[]",
  },
];

// CTA ribbon
export const ABOUT_CTA_FIELDS: FieldConfig[] = [
  {
    path: "ctaRibbon.heading",
    label: "CTA ribbon heading",
    description: "Big line in the coloured strip under About.",
    type: "string",
  },
  {
    path: "ctaRibbon.subheading",
    label: "CTA ribbon subheading",
    description: "Smaller line under the CTA heading.",
    type: "string",
  },
];

// Convenience export if you still want the full list somewhere
export const ABOUT_FIELDS: FieldConfig[] = [
  ...ABOUT_HEADER_FIELDS,
  ...ABOUT_HERO_FIELDS,
  ...ABOUT_STATS_COURSES_FIELDS,
  ...ABOUT_CTA_FIELDS,
];
