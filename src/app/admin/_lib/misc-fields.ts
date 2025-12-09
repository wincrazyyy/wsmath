// app/admin/_lib/misc-fields.ts
import type { FieldConfig } from "./fields";

export const WHATSAPP_GLOBAL_FIELDS: FieldConfig[] = [
  {
    path: "whatsapp.phoneNumber",
    label: "WhatsApp phone number",
    description: "Used for wa.me link. Prefer digits only, e.g. 85293199914.",
    type: "string",
  },
  {
    path: "whatsapp.prefillText",
    label: "WhatsApp pre-filled message",
    description: "Default message that appears in WhatsApp chat.",
    type: "textarea",
  },
];

export const MISC_FIELDS: FieldConfig[] = [
  ...WHATSAPP_GLOBAL_FIELDS,
];
