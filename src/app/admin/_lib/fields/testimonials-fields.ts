// app/admin/_lib/fields/testimonials-fields.ts
import { type FieldConfig, repeatFields } from "./fields";

export const TESTIMONIALS_HEADER_FIELDS: FieldConfig[] = [
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
    description: "Main heading for the Testimonials section.",
    type: "string",
  },
  {
    path: "header.subtitle",
    label: "Header subtitle",
    description: "Short description under the heading.",
    type: "textarea",
  },
];

export const TESTIMONIALS_VIDEO_FIELDS: FieldConfig[] = [
  {
    path: "video.eyebrow",
    label: "Student voices – Eyebrow label",
    description: "Small label above the video (e.g. “Student voices”).",
    type: "string",
  },
  {
    path: "video.heading",
    label: "Student voices – Heading",
    description: "Main title above the student voices video.",
    type: "string",
  },
  {
    path: "video.subheading",
    label: "Student voices – Subheading",
    description: "Short description under the heading.",
    type: "textarea",
  },
  {
    path: "video.src",
    label: "Student voices – Video src",
    description:
      "Path to the mp4 file in /public (e.g. /video/student-voices.mp4).",
    type: "string",
  },
  {
    path: "video.poster",
    label: "Student voices – Poster image",
    description:
      "Optional poster image for the video (e.g. /video/student-voices-poster.jpg).",
    type: "string",
  },
];

function testimonialFields(
  basePath: string,
  labelPrefix: string
): FieldConfig[] {
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
      description:
        "Short line under the name, e.g. “IBDP AAHL — Level 7”.",
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
      description:
        "Optional avatar image in /public/avatars (e.g. /avatars/yuki.jpg).",
      type: "string",
    },
  ];
}

export const TESTIMONIALS_FEATURED_FIELDS: FieldConfig[] = [
  ...repeatFields(
    "featured",
    "Featured",
    4,
    (path, label) => testimonialFields(path, label)
  )
];

export const TESTIMONIALS_CAROUSEL_FIELDS: FieldConfig[] = [
  ...repeatFields(
    "carousel",
    "Carousel",
    4,
    (path, label) => testimonialFields(path, label)
  )
];

export const TESTIMONIALS_FIELDS: FieldConfig[] = [
  ...TESTIMONIALS_HEADER_FIELDS,
  ...TESTIMONIALS_VIDEO_FIELDS,
  ...TESTIMONIALS_FEATURED_FIELDS,
  ...TESTIMONIALS_CAROUSEL_FIELDS,
];
