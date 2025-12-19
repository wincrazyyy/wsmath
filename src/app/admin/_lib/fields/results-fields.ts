// app/admin/_lib/results-fields.ts
import { type FieldConfig, repeatFields } from "./fields";

export const RESULTS_HEADER_FIELDS: FieldConfig[] = [
  {
    path: "header.eyebrow",
    label: "Header eyebrow",
    description:
      'Small label above the section heading (e.g. “STUDENT VOICES”).',
    type: "string",
  },
  {
    path: "header.title",
    label: "Header title",
    description: "Main heading for the Results section.",
    type: "string",
  },
  {
    path: "header.subtitle",
    label: "Header subtitle",
    description: "Short description under the heading.",
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
export const RESULTS_GRADE_HEADERS_FIELDS: FieldConfig[] = [
  // Headers
  {
    path: "gradeImprovements.header.title",
    label: "Grade improvements – title",
    description: "Main heading shown above the grade improvements block.",
    type: "string",
  },
  {
    path: "gradeImprovements.header.description",
    label: "Grade improvements – description",
    description:
      "Short intro sentence explaining what the grade improvements chart shows.",
    type: "string",
  },
  {
    path: "gradeImprovements.summaryCards.top",
    label: "Summary card – top grade",
    description:
      "Text for the top-grade summary card. Use # as a placeholder for the grade.",
    type: "string",
  },
  {
    path: "gradeImprovements.summaryCards.second",
    label: "Summary card – second top grade",
    description:
      "Text for the second-top-grade summary card. Use # as a placeholder for the grade.",
    type: "string",
  },
  {
    path: "gradeImprovements.summaryCards.bigJumps",
    label: "Summary card – big jumps",
    description:
      "Text for the ‘major jumps’ summary card.",
    type: "string",
  },
  {
    path: "gradeImprovements.summaryCards.improvements",
    label: "Summary card – improvements",
    description:
      "Text for the ‘improvements’ summary card.",
    type: "string",
  },
];

function resultGroupsFields(
  basePath: string,
  labelPrefix: string
): FieldConfig[] {
  return [
    {
      path: `${basePath}.tab`,
      label: `${labelPrefix} – Tab`,
      description: "Programme group tab.",
      type: "string",
    },
    {
      path: `${basePath}.subTab`,
      label: `${labelPrefix} – Sub tab`,
      description: "Programme group sub tab (if any).",
      type: "string",
    },
    {
      path: `${basePath}.programLabel`,
      label: `${labelPrefix} – Programme label`,
      description:
        "Programme full name, including all the small details (programme code).",
      type: "string",
    },
    {
      path: `${basePath}.students`,
      label: `${labelPrefix} – Programme students`,
      description: "Edit the students in a table.",
      type: "table",
      table: {
        itemLabel: "student",
        columns: [
          { key: "name", label: "Name" },
          { key: "year", label: "Year", kind: "number" },
          { key: "from", label: "From" },
          { key: "to", label: "To" },
          { key: "months", label: "Months", kind: "number", placeholder: "(optional)" },
        ],
        minTableWidthPx: 860,
        sortBy: [
          { key: "year", order: "desc" },
          { key: "to", order: "desc" },
          { key: "from", order: "desc" },
          { key: "name", order: "asc" },
        ],
      },
    },
    {
      path: `${basePath}.gradeScale`,
      label: `${labelPrefix} – Programme grade scale`,
      description:
        "Programme grade scale area (ordered from lowest to highest).",
      type: "string[]",
    },
  ];
}

export const RESULTS_GRADE_DATA_FIELDS: FieldConfig[] = [
  ...repeatFields(
    "gradeImprovements.resultGroups",
    "Programme group",
    6,
    (path, label) => resultGroupsFields(path, label)
  ),
];

export const RESULTS_GRADE_MISC_FIELDS: FieldConfig[] = [
  {
    path: "gradeImprovements.tableHeader.keyColumn",
    label: "Heatmap table key column label (left column)",
    description:
      "Key column label of the improvement table: the label for the legend of the table (left column).",
    type: "string",
  },
  {
    path: "gradeImprovements.tableHeader.col0to1",
    label: "Heatmap table – column 1 (0–1)",
    description: "Header label for the 0–1 improvements column.",
    type: "string",
  },
  {
    path: "gradeImprovements.tableHeader.col2",
    label: "Heatmap table – column 2 (2)",
    description: "Header label for the 2 improvements column.",
    type: "string",
  },
  {
    path: "gradeImprovements.tableHeader.col3",
    label: "Heatmap table – column 3 (3)",
    description: "Header label for the 3 improvements column.",
    type: "string",
  },
  {
    path: "gradeImprovements.tableHeader.col4plus",
    label: "Heatmap table – column 4 (4+)",
    description: "Header label for the 4+ improvements column.",
    type: "string",
  },
  {
    path: "gradeImprovements.footerNote",
    label: "Footer note",
    description:
      "Small helper text under the table (e.g. ‘Hover on each cell to see the students.’).",
    type: "string",
  },
];


export const RESULTS_CTA_FIELDS: FieldConfig[] = [
  {
    path: "resultsCta.heading",
    label: "Results CTA – Heading",
    description: "Big title in the WhatsApp CTA box.",
    type: "string",
  },
  {
    path: "resultsCta.subheading",
    label: "Results CTA – Subheading",
    description: "Short description under the heading.",
    type: "string",
  },
  {
    path: "resultsCta.bullets",
    label: "Results CTA – Bullet points",
    description:
      "One benefit per line. Shown as bullet points above the button.",
    type: "string[]",
  },
  {
    path: "resultsCta.note",
    label: "Results CTA – Small note",
    description: "Tiny note under the button (e.g. response / what to send).",
    type: "string",
  },
  {
    path: "resultsCta.logoSrc",
    label: "Results CTA – Logo image path",
    description:
      "Path to the logo image in /public (e.g. /icon.svg).",
    type: "string",
  },
];

export const RESULTS_FIELDS: FieldConfig[] = [
  ...RESULTS_HEADER_FIELDS,
  ...RESULTS_GRADE_HEADERS_FIELDS,
  ...RESULTS_GRADE_DATA_FIELDS,
  ...RESULTS_GRADE_MISC_FIELDS,
  ...RESULTS_CTA_FIELDS,
];
