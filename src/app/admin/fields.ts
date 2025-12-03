// app/admin/fields.ts
export type FieldType = "string" | "textarea" | "string[]";

export type FieldConfig = {
  path: string;
  label: string;
  description?: string;
  type: FieldType;
};

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
];

export const PROOF_PILLS_FIELDS: FieldConfig[] = [
  {
    path: "proofPills",
    label: "Homepage proof pills",
    description: "One selling point per line. These show under the hero as animated badges.",
    type: "string[]",
  },
];
