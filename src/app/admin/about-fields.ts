// app/admin/about-fields.ts
import type { FieldConfig } from "./fields";

export const ABOUT_FIELDS: FieldConfig[] = [
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
    path: "whatYouGet",
    label: "What you get (bullets)",
    description: "One benefit per line. Appears in the left card above the image.",
    type: "string[]",
  },
  {
    path: "howITeach",
    label: "How I teach (bullets)",
    description: "One teaching point per line. Appears in the right card above the image.",
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
