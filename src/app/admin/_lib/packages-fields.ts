// app/admin/_lib/packages-fields.ts
import type { FieldConfig } from "./fields";

// Top heading + intro
export const PACKAGES_SECTION_FIELDS: FieldConfig[] = [
  {
    path: "title",
    label: "Packages title",
    description: 'Main heading of the packages section.',
    type: "string",
  },
  {
    path: "subtitle",
    label: "Packages subtitle",
    description: "Short paragraph under the heading.",
    type: "textarea",
  },
  {
    path: "topBadge",
    label: "Top badge text",
    description:
      'Small pill on the right, e.g. “IB / A-Level specialist since 2017”.',
    type: "string",
  },
];

// Comparison strip
export const PACKAGES_COMPARISON_FIELDS: FieldConfig[] = [
  {
    path: "comparison.privateLabel",
    label: "Comparison – private label",
    description:
      'Label above the private rate, e.g. “Standard 1-to-1 rate”.',
    type: "string",
  },
  {
    path: "comparison.groupLabel",
    label: "Comparison – group label",
    description:
      'Label above the group price, e.g. “Group course investment”.',
    type: "string",
  },
  {
    path: "comparison.title",
    label: "Comparison – title",
    description:
      'Title inside the white comparison box, e.g. “Value comparison”.',
    type: "string",
  },
  {
    path: "comparison.privateLinePrefix",
    label: "Comparison – private line prefix",
    description:
      'Text before the private 32h value, e.g. “32 hours 1-to-1 ≈”.',
    type: "string",
  },
  {
    path: "comparison.groupLineSuffix",
    label: "Comparison – group line suffix",
    description:
      'Text after the group price, e.g. “for 32 structured group sessions.”',
    type: "string",
  },
];

// Private card (main + intensive + button note)
export const PACKAGES_PRIVATE_FIELDS: FieldConfig[] = [
  {
    path: "private.label",
    label: "Private – badge label",
    description: 'Small pill at the top, e.g. “Premium 1-to-1”.',
    type: "string",
  },
  {
    path: "private.rateLabel",
    label: "Private – rate label",
    description: 'Caption above the price, e.g. “Typical rate”.',
    type: "string",
  },
  {
    path: "private.hourlyRate",
    label: "Private – hourly rate (HKD)",
    description: "Digits only, e.g. 1500. Will be parsed as a number.",
    type: "string",
  },
  {
    path: "private.title",
    label: "Private – title",
    description: 'Card title, e.g. “Private online coaching”.',
    type: "string",
  },
  {
    path: "private.description",
    label: "Private – description",
    description: "Short description under the title.",
    type: "textarea",
  },
  {
    path: "private.points",
    label: "Private – bullet points",
    description: "One main benefit per line.",
    type: "string[]",
  },
  // Intensive block
  {
    path: "private.intensive.label",
    label: "Private intensive – label",
    description: 'Top label, e.g. “8-lesson intensive”.',
    type: "string",
  },
  {
    path: "private.intensive.lessons",
    label: "Private intensive – number of lessons",
    description: "Digits only, e.g. 8. Used to compute package cost.",
    type: "string",
  },
  {
    path: "private.intensive.bodyPrefix",
    label: "Private intensive – body prefix",
    description: 'Text before the cost, e.g. “Around”.',
    type: "string",
  },
  {
    path: "private.intensive.points",
    label: "Private intensive – bullet points",
    description:
      "One line per benefit (priority correspondence, IA support, etc.).",
    type: "string[]",
  },
  {
    path: "private.buttonNote",
    label: "Private – note under WhatsApp button",
    description: "Small hint text, e.g. what to mention in the message.",
    type: "string",
  },
];

// Group card + leaflet
export const PACKAGES_GROUP_FIELDS: FieldConfig[] = [
  {
    path: "group.label",
    label: "Group – badge label",
    description: 'Small pill, e.g. “High-value group”.',
    type: "string",
  },
  {
    path: "group.tag",
    label: "Group – tag (right chip)",
    description: 'Small chip on the right, e.g. “Most popular”.',
    type: "string",
  },
  {
    path: "group.programmeLabel",
    label: "Group – programme label",
    description: 'Caption above the price, e.g. “Full programme”.',
    type: "string",
  },
  {
    path: "group.price",
    label: "Group – full price (HKD)",
    description: "Digits only, e.g. 16800.",
    type: "string",
  },
  {
    path: "group.lessons",
    label: "Group – number of lessons",
    description: "Digits only, e.g. 32. Used to derive per-lesson rate.",
    type: "string",
  },
  {
    path: "group.title",
    label: "Group – title",
    description: 'Card title, e.g. “32-lesson Zoom group course”.',
    type: "string",
  },
  {
    path: "group.description",
    label: "Group – description",
    description: "Short description under the title.",
    type: "textarea",
  },
  {
    path: "group.points",
    label: "Group – bullet points",
    description: "One line per key feature of the group course.",
    type: "string[]",
  },
  // Leaflet
  {
    path: "group.leaflet.label",
    label: "Leaflet – header label",
    description:
      'Small label above the preview, e.g. “Course leaflet preview”.',
    type: "string",
  },
  {
    path: "group.leaflet.pages",
    label: "Leaflet – page image paths",
    description:
      "One /leaflets/...jpg per line. Shown as A4 preview pages.",
    type: "string[]",
  },
  {
    path: "group.leaflet.autoAdvanceSeconds",
    label: "Leaflet – auto-advance seconds",
    description: "Digits only, e.g. 5. How often to auto-advance pages.",
    type: "string",
  },
];

export const PACKAGES_FIELDS: FieldConfig[] = [
  ...PACKAGES_SECTION_FIELDS,
  ...PACKAGES_COMPARISON_FIELDS,
  ...PACKAGES_PRIVATE_FIELDS,
  ...PACKAGES_GROUP_FIELDS,
];
