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

const VIDEO_FIELDS: FieldConfig[] = [
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
    description: "Path to the mp4 file in /public (e.g. /video/student-voices.mp4).",
    type: "string",
  },
  {
    path: "video.poster",
    label: "Student voices – Poster image",
    description: "Optional poster image for the video (e.g. /video/student-voices-poster.jpg).",
    type: "string",
  },
];

const FEATURED_TESTIMONIAL_FIELDS: FieldConfig[] = [
  ...testimonialFields("featured[0]", "Featured #1"),
  ...testimonialFields("featured[1]", "Featured #2"),
  ...testimonialFields("featured[2]", "Featured #3"),
  ...testimonialFields("featured[3]", "Featured #4"),
];

const CAROUSEL_TESTIMONIAL_FIELDS: FieldConfig[] = [
  ...testimonialFields("carousel[0]", "Carousel #1"),
  ...testimonialFields("carousel[1]", "Carousel #2"),
  ...testimonialFields("carousel[2]", "Carousel #3"),
  ...testimonialFields("carousel[3]", "Carousel #4"),
];

export const TESTIMONIALS_FIELDS: FieldConfig[] = [
  ...VIDEO_FIELDS,
  ...FEATURED_TESTIMONIAL_FIELDS,
  ...CAROUSEL_TESTIMONIAL_FIELDS,
];
