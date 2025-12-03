// app/admin/_lib/testimonials-fields.ts
import type { FieldConfig } from "./fields";

function testimonialFields(basePath: string, labelPrefix: string): FieldConfig[] {
  return [
    {
      path: `${basePath}.name`,
      label: `${labelPrefix} – Name`,
      description: "Student or parent name (shown in bold).",
      type: "string",
    },
    {
      path: `${basePath}.role`,
      label: `${labelPrefix} – Role / result`,
      description: "Short line under the name, e.g. “IBDP AAHL — Level 7”.",
      type: "string",
    },
    {
      path: `${basePath}.quote`,
      label: `${labelPrefix} – Quote`,
      description: "Full testimonial text.",
      type: "textarea",
    },
    {
      path: `${basePath}.avatarSrc`,
      label: `${labelPrefix} – Avatar image path`,
      description: "Optional avatar image in /public/avatars (e.g. /avatars/yuki.jpg).",
      type: "string",
    },
  ];
}

const FEATURED_TESTIMONIAL_FIELDS: FieldConfig[] = [
  ...testimonialFields("featured[0]", "Featured #1"),
  ...testimonialFields("featured[1]", "Featured #2"),
  ...testimonialFields("featured[2]", "Featured #3"),
  ...testimonialFields("featured[3]", "Featured #4"),
];

const MAX_CAROUSEL_ITEMS = 12;

const CAROUSEL_TESTIMONIAL_FIELDS: FieldConfig[] = Array.from(
  { length: MAX_CAROUSEL_ITEMS },
  (_, index) => testimonialFields(`carousel[${index}]`, `Carousel #${index + 1}`)
).flat();

export const TESTIMONIALS_FIELDS: FieldConfig[] = [
  ...FEATURED_TESTIMONIAL_FIELDS,
  ...CAROUSEL_TESTIMONIAL_FIELDS,
];
