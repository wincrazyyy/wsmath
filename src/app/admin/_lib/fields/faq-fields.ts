// app/admin/_lib/fields/faq-fields.ts
import { repeatFields, type FieldConfig } from "./fields";

export const FAQ_HEADER_FIELDS: FieldConfig[] = [
  {
    path: "header.eyebrow",
    label: "Header eyebrow",
    description: "Small text above the main heading.",
    type: "string",
  },
  {
    path: "header.title",
    label: "Header title",
    description: "Main heading for the FAQ section.",
    type: "string",
  },
  {
    path: "header.subtitle",
    label: "Header subtitle",
    description: "Short description under the heading.",
    type: "textarea",
  },
];

export const FAQ_TOP_FIELDS: FieldConfig[] = [
  {
    path: "top.eyebrow",
    label: "Top eyebrow",
    description: "Small text above the main heading.",
    type: "string",
  },
  {
    path: "top.heading",
    label: "Top heading",
    description: "Main heading for the FAQ section.",
    type: "string",
  },
  {
    path: "top.subheading",
    label: "Top subheading",
    description: "Short description under the heading.",
    type: "textarea",
  },
];

function faqFields(
  basePath: string,
  labelPrefix: string
): FieldConfig[] {
  return [
    {
      path: `${basePath}.q`,
      label: `${labelPrefix} – Question`,
      description: "The question text shown in the FAQ item.",
      type: "string",
    },
    {
      path: `${basePath}.a`,
      label: `${labelPrefix} – Answer`,
      description:
        "The answer text shown in the FAQ item.",
      type: "textarea",
    }
  ];
}

export function makeFaqItemsFields(count: number): FieldConfig[] {
  return repeatFields("items", "FAQ", count, (path, label) =>
    faqFields(path, label)
  );
}

export function makeFaqFields(opts: {
  faqCount: number;
}): FieldConfig[] {
  return [
    ...FAQ_HEADER_FIELDS,
    ...FAQ_TOP_FIELDS,
    ...makeFaqItemsFields(opts.faqCount),
  ];
}
