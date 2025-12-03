// app/admin/_lib/misc-fields.ts
import type { FieldConfig } from "./fields";

export const WHATSAPP_CTA_FIELDS: FieldConfig[] = [
  {
    path: "whatsappCta.heading",
    label: "WhatsApp CTA – Heading",
    description: "Big title in the WhatsApp CTA box.",
    type: "string",
  },
  {
    path: "whatsappCta.subheading",
    label: "WhatsApp CTA – Subheading",
    description: "Short description under the heading.",
    type: "string",
  },
  {
    path: "whatsappCta.bullets",
    label: "WhatsApp CTA – Bullet points",
    description: "One benefit per line. Shown as bullet points above the button.",
    type: "string[]",
  },
  {
    path: "whatsappCta.note",
    label: "WhatsApp CTA – Small note",
    description: "Tiny note under the button (e.g. response / what to send).",
    type: "string",
  },
  {
    path: "whatsappCta.logoSrc",
    label: "WhatsApp CTA – Logo image path",
    description: "Path to the logo image in /public (e.g. /icon.svg).",
    type: "string",
  },
];

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
  ...WHATSAPP_CTA_FIELDS,
  ...WHATSAPP_GLOBAL_FIELDS,
];
