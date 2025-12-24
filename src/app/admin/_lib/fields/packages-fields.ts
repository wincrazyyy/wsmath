import type { FieldConfig } from "./fields";

// Header (SectionHeader)
export const PACKAGES_HEADER_FIELDS: FieldConfig[] = [
  {
    path: "header.eyebrow",
    label: "Header – eyebrow",
    description:
      'Small label above the title, e.g. “COACHING PACKAGES”. Leave blank to hide.',
    type: "string",
  },
  {
    path: "header.title",
    label: "Header – title",
    description: "Main heading of the packages section.",
    type: "string",
  },
  {
    path: "header.subtitle",
    label: "Header – subtitle",
    description: "Short paragraph under the heading.",
    type: "textarea",
  },
  {
    path: "header.chips",
    label: "Header – proof pills",
    description:
      "One selling point per line. These show as small animated badges under the heading.",
    type: "string[]",
  },

  // Right accent card
  {
    path: "header.rightAccent.heading",
    label: "Right card – heading",
    description:
      'Title of the right-side accent box, e.g. “Results snapshot”.',
    type: "string",
  },
  {
    path: "header.rightAccent.badge",
    label: "Right card – badge",
    description: 'Small badge above the main stat, e.g. “Since 2017”.',
    type: "string",
  },
  {
    path: "header.rightAccent.mainValue",
    label: "Right card – main value",
    description: 'Big stat number, e.g. “250+”.',
    type: "string",
  },
  {
    path: "header.rightAccent.mainLabel",
    label: "Right card – main label",
    description:
      'Text under the main value, e.g. “students coached 1-on-1”.',
    type: "string",
  },
  {
    path: "header.rightAccent.mainSize",
    label: "Right card – main size",
    description: 'Visual size of the main stat. Use “sm” or “lg”.',
    type: "string",
  },

  // Right accent columns (you can tweak these labels; they match your JSON)
  {
    path: "header.rightAccent.columns[0].title",
    label: "Right card – column 1 title",
    description: 'E.g. “IBDP HL 7 rate”.',
    type: "string",
  },
  {
    path: "header.rightAccent.columns[0].items",
    label: "Right card – column 1 items",
    description: "One line per stat under column 1.",
    type: "string[]",
  },
  {
    path: "header.rightAccent.columns[1].title",
    label: "Right card – column 2 title",
    description: 'E.g. “IGCSE A / A*”.',
    type: "string",
  },
  {
    path: "header.rightAccent.columns[1].items",
    label: "Right card – column 2 items",
    description: "One line per stat under column 2.",
    type: "string[]",
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
    path: "private.privateSrc",
    label: "Private – image for private card",
    description: "Path to image shown in the private package card. e.g. /private-package.jpg.",
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
    path: "group.originalPrice",
    label: "Group – original price (HKD)",
    description: "Digits only, e.g. 60000.",
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

// IA Support (covered in 1-to-1)
export const PACKAGES_IA_SUPPORT_FIELDS: FieldConfig[] = [
  {
    path: "iaSupport.eyebrow",
    label: "IA Support – eyebrow",
    description: "Small label above the IA support title.",
    type: "string",
  },
  {
    path: "iaSupport.title",
    label: "IA Support – title",
    description: "Main heading for the IA support block.",
    type: "string",
  },
  {
    path: "iaSupport.description",
    label: "IA Support – description",
    description: "Short paragraph under the IA support title.",
    type: "textarea",
  },

  // CTA
  {
    path: "iaSupport.ctaLabel",
    label: "IA Support – button label",
    description: "CTA button label text.",
    type: "string",
  },

  // Lesson structure
  {
    path: "iaSupport.lessonStructureTitle",
    label: "IA Support – lesson structure title",
    description: "Title above the lesson structure list.",
    type: "string",
  },
  {
    path: "iaSupport.lessonStructure",
    label: "IA Support – lesson structure bullets",
    description: "One bullet per line.",
    type: "string[]",
  },

  // Topics
  {
    path: "iaSupport.topicsTitle",
    label: "IA Support – topics title",
    description: "Title above the topic directions grid/table.",
    type: "string",
  },
  {
    path: "iaSupport.topics",
    label: "IA Support – topics",
    description: "Edit IA topic directions in a table.",
    type: "table",
    table: {
      itemLabel: "topic",
      columns: [
        { key: "title", label: "Title" },
        { key: "desc", label: "Description", kind: "textarea", placeholder: "Write a short description…" },
      ],
      sortBy: [{ key: "title", order: "asc" }],
      minTableWidthPx: 860,
    },
  },


  // Coverage note
  {
    path: "iaSupport.coverageNote",
    label: "IA Support – coverage note",
    description: "Small note under the block (e.g. covered in Solo 1-to-1 lessons).",
    type: "string",
  },
];

export const PACKAGES_FIELDS: FieldConfig[] = [
  ...PACKAGES_HEADER_FIELDS,
  ...PACKAGES_COMPARISON_FIELDS,
  ...PACKAGES_PRIVATE_FIELDS,
  ...PACKAGES_GROUP_FIELDS,
  ...PACKAGES_IA_SUPPORT_FIELDS,
];

