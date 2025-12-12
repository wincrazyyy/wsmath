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
  ...RESULTS_CTA_FIELDS,
];
