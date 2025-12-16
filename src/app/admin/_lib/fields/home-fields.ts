// app/admin/_lib/home-fields.ts
import type { FieldConfig } from "./fields";

export const HERO_FIELDS: FieldConfig[] = [
  {
    path: "hero.title",
    label: "Hero title (name / brand)",
    description: "Big title at the top, e.g. “Winson Siu”.",
    type: "string",
  },
  {
    path: "hero.subtitle",
    label: "Hero subtitle",
    description: "Short English line under the title.",
    type: "string",
  },
  {
    path: "hero.tagline",
    label: "Hero tagline (Chinese)",
    description: "Chinese line explaining what you do.",
    type: "string",
  },
  {
    path: "hero.imageSrc",
    label: "Hero image path",
    description: "Path to the hero image in /public, e.g. /hero.png.",
    type: "string",
  },

  // Hero stat (18,000+ teaching hours)
  {
    path: "hero.stat.value",
    label: "Hero stat value",
    description: "Big number shown in the hero.",
    type: "string",
  },
  {
    path: "hero.stat.label",
    label: "Hero stat label (English)",
    description: "Short label next to the number.",
    type: "string",
  },
  {
    path: "hero.stat.subLabel",
    label: "Hero stat sublabel (Chinese, optional)",
    description: "Optional smaller Chinese label.",
    type: "string",
  },
];

export const PROOF_PILLS_FIELDS: FieldConfig[] = [
  {
    path: "proofPills",
    label: "Homepage proof pills",
    description:
      "One selling point per line. These show under the hero as animated badges.",
    type: "string[]",
  },
];

export const HOME_FIELDS: FieldConfig[] = [
  ...HERO_FIELDS,
  ...PROOF_PILLS_FIELDS
];
