// app/admin/_lib/about-fields.ts
import type { FieldConfig } from "./fields";

export const ABOUT_SECTION_FIELDS: FieldConfig[] = [{
    path: "title",
    label: "About title",
    description: "Main heading for the About section.",
    type: "string",
  },
  {
    path: "lead",
    label: "About lead paragraph",
    description: "Main intro text under the About heading.",
    type: "textarea",
  },
  {
    path: "imageSrc",
    label: "About image path",
    description: "Path to the horizontal image (e.g. /about-hero.png).",
    type: "string",
  },
  {
    path: "eyebrow",
    label: "Eyebrow label",
    description: "Small label on the image (e.g. your name + title).",
    type: "string",
  },
  {
    path: "area1.title",
    label: "Left area title",
    description: "Title for the left card above the image.",
    type: "string",
  },
  {
    path: "area1.items",
    label: "Left area (bullets)",
    description: "One bullet point per line. Appears in the left card above the image.",
    type: "string[]",
  },
  {
    path: "area2.title",
    label: "Right area title",
    description: "Title for the right card above the image.",
    type: "string",
  },
  {
    path: "area2.items",
    label: "Right area (bullets)",
    description: "One bullet point per line. Appears in the right card above the image.",
    type: "string[]",
  },
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

export const CTA_RIBBON_FIELDS: FieldConfig[] = [
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

export const ABOUT_FIELDS: FieldConfig[] = [
  ...ABOUT_SECTION_FIELDS,
  ...CTA_RIBBON_FIELDS,
];
