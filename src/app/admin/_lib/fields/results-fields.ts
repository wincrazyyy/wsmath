// app/admin/_lib/results-fields.ts
import type { FieldConfig } from "./fields";

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
      "Text for the top-grade summary card. Use # as a placeholder for the grade (e.g. ⭐ Final grade #).",
    type: "string",
  },
  {
    path: "gradeImprovements.summaryCards.second",
    label: "Summary card – second top grade",
    description:
      "Text for the second-top-grade summary card. Use # as a placeholder for the grade (e.g. ⭐ Final grade #).",
    type: "string",
  },
  {
    path: "gradeImprovements.summaryCards.bigJumps",
    label: "Summary card – big jumps",
    description:
      "Text for the ‘major jumps’ summary card (e.g. 🔥 Major jumps (≥3 grades)).",
    type: "string",
  },
  {
    path: "gradeImprovements.summaryCards.fastTrack",
    label: "Summary card – fast track",
    description:
      "Text for the ‘fast-track’ summary card (e.g. ⚡ Fast-track (≈3 months)).",
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
      path: `${basePath}.studentsKey`,
      label: `${labelPrefix} – Students key`,
      description: "Should change later...",
      type: "string",
    },
    {
      path: `${basePath}.gradeScale`,
      label: `${labelPrefix} – Programme grade scale`,
      description:
        "Programme grade scale identifier.",
      type: "string",
    },
  ];
}


export const RESULTS_GRADE_GROUPS_FIELDS: FieldConfig[] = [
  ...resultGroupsFields("gradeImprovements.resultGroups[0]", "Programme Group #1"),
  ...resultGroupsFields("gradeImprovements.resultGroups[1]", "Programme Group #2"),
  ...resultGroupsFields("gradeImprovements.resultGroups[2]", "Programme Group #3"),
  ...resultGroupsFields("gradeImprovements.resultGroups[3]", "Programme Group #4"),
  ...resultGroupsFields("gradeImprovements.resultGroups[4]", "Programme Group #5"),
  ...resultGroupsFields("gradeImprovements.resultGroups[5]", "Programme Group #6"),
];

export const RESULTS_GRADE_STUDENTS_FIELDS: FieldConfig[] = [
  {
    path: "gradeImprovements.students",
    label: "Students by programme",
    description:
      "JSON object mapping studentsKey → list of students with name, year, from, to, and optional months. You can add as many students as you like.",
    type: "json",
  },
];

export const RESULTS_GRADE_DATA_FIELDS: FieldConfig[] = [
  {
    path: "gradeImprovements.resultGroups",
    label: "Programme groups & tabs",
    description:
      "JSON array of result groups (e.g. IBDP / A-Level / IGCSE) and their items/tabs. You can add or remove groups and items as needed.",
    type: "json",
  },
  {
    path: "gradeImprovements.students",
    label: "Students by programme",
    description:
      "JSON object mapping studentsKey → list of students with name, year, from, to, and optional months. You can add as many students as you like.",
    type: "json",
  },
];

export const RESULTS_GRADE_MISC_FIELDS: FieldConfig[] = [
  {
    path: "gradeImprovements.table",
    label: "Heatmap table configuration",
    description:
      "JSON for the improvement table: key/left/right column labels and the list of heatmap rows (labels + descriptions). Rows can be added or removed.",
    type: "json",
  },
  {
    path: "gradeImprovements.scales",
    label: "Grade scales",
    description:
      "JSON object defining grade scales (ib, al, igcse, etc.) as ordered arrays of grade labels. You can add new scales or adjust existing ones.",
    type: "json",
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
  ...RESULTS_GRADE_GROUPS_FIELDS,
  ...RESULTS_GRADE_DATA_FIELDS,
  ...RESULTS_GRADE_MISC_FIELDS,
  ...RESULTS_CTA_FIELDS,
];
