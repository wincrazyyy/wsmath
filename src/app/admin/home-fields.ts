// app/admin/home-fields.ts
import type { FieldConfig } from "./fields";
import { HERO_FIELDS, PROOF_PILLS_FIELDS } from "./fields";

export const HOME_FIELDS: FieldConfig[] = [
  ...HERO_FIELDS,
  ...PROOF_PILLS_FIELDS,
];
