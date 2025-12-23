// app/admin/_lib/fields/misc-fields.ts
import type { FieldConfig } from "./fields";

export const WHATSAPP_GLOBAL_FIELDS: FieldConfig[] = [
  {
    path: "whatsapp.phoneNumber",
    label: "WhatsApp – phone number",
    description:
      "Used to build the wa.me link. Prefer digits only (no +), e.g. 85293199914.",
    type: "string",
  },
  {
    path: "whatsapp.prefillText",
    label: "WhatsApp – pre-filled message",
    description:
      "Default message that appears in WhatsApp when users click the CTA.",
    type: "textarea",
  },
];

export const PRIVACY_POLICY_FIELDS: FieldConfig[] = [
  {
    path: "privacyPolicy.modalTitle",
    label: "Privacy policy – modal title",
    description: "Title shown at the top of the privacy policy modal.",
    type: "string",
  },
  {
    path: "privacyPolicy.lastUpdatedLabel",
    label: "Privacy policy – last updated label",
    description: "Label shown before the date, e.g. “Last updated:”.",
    type: "string",
  },
  {
    path: "privacyPolicy.lastUpdated",
    label: "Privacy policy – last updated date",
    description: "Date text shown in the modal header, e.g. 2025-12-22.",
    type: "string",
  },
  {
    path: "privacyPolicy.intro",
    label: "Privacy policy – intro",
    description: "Intro paragraph at the top of the modal.",
    type: "textarea",
  },

  // Sections (fixed indices, since you currently have 4)
  {
    path: "privacyPolicy.sections.0.heading",
    label: "Privacy policy – section 1 heading",
    description: "Heading for section 1.",
    type: "string",
  },
  {
    path: "privacyPolicy.sections.0.body",
    label: "Privacy policy – section 1 body",
    description: "Body text for section 1.",
    type: "textarea",
  },
  {
    path: "privacyPolicy.sections.1.heading",
    label: "Privacy policy – section 2 heading",
    description: "Heading for section 2.",
    type: "string",
  },
  {
    path: "privacyPolicy.sections.1.body",
    label: "Privacy policy – section 2 body",
    description: "Body text for section 2.",
    type: "textarea",
  },
  {
    path: "privacyPolicy.sections.2.heading",
    label: "Privacy policy – section 3 heading",
    description: "Heading for section 3.",
    type: "string",
  },
  {
    path: "privacyPolicy.sections.2.body",
    label: "Privacy policy – section 3 body",
    description: "Body text for section 3.",
    type: "textarea",
  },
  {
    path: "privacyPolicy.sections.3.heading",
    label: "Privacy policy – section 4 heading",
    description: "Heading for section 4.",
    type: "string",
  },
  {
    path: "privacyPolicy.sections.3.body",
    label: "Privacy policy – section 4 body",
    description: "Body text for section 4.",
    type: "textarea",
  },

  // Footer hint + button
  {
    path: "privacyPolicy.footerHintPrefix",
    label: "Privacy policy – footer hint (prefix)",
    description: "Text before the key, e.g. “Click outside or press”.",
    type: "string",
  },
  {
    path: "privacyPolicy.footerHintKey",
    label: "Privacy policy – footer hint (key)",
    description: "Key text shown in bold, e.g. “Esc”.",
    type: "string",
  },
  {
    path: "privacyPolicy.footerHintSuffix",
    label: "Privacy policy – footer hint (suffix)",
    description: "Text after the key, e.g. “to close.”",
    type: "string",
  },
  {
    path: "privacyPolicy.closeButton",
    label: "Privacy policy – close button label",
    description: "Label for the bottom close button.",
    type: "string",
  },
];

export const FOOTER_FIELDS: FieldConfig[] = [
  // Brand block
  {
    path: "footer.brand.name",
    label: "Footer – brand name",
    description: "Main brand name shown in the footer (e.g. “WSMath”).",
    type: "string",
  },
  {
    path: "footer.brand.tagline",
    label: "Footer – brand tagline",
    description:
      "Short subtitle under the brand name (can be bilingual). Keep it one line if possible.",
    type: "string",
  },
  {
    path: "footer.brand.description",
    label: "Footer – brand description",
    description:
      "Short paragraph describing WSMath. Appears under the logo block.",
    type: "textarea",
  },
  {
    path: "footer.brand.iconSrc",
    label: "Footer – logo icon path",
    description:
      "Path to the brand icon used in the footer (e.g. /icon.svg).",
    type: "string",
  },
  {
    path: "footer.brand.backToTop.label",
    label: "Footer – back to top label",
    description:
      "Text for the small link chip (anchors to the top section). Example: “Back to top”.",
    type: "string",
  },

  // Columns: titles + link labels
  {
    path: "footer.columns.0.title",
    label: "Footer column 1 – title",
    description: "Title for the first footer link column (e.g. “Programs”).",
    type: "string",
  },
  {
    path: "footer.columns.0.links.0.label",
    label: "Footer column 1 – link 1 label",
    description: "Label only. Destination is fixed in code (section anchor).",
    type: "string",
  },
  {
    path: "footer.columns.0.links.1.label",
    label: "Footer column 1 – link 2 label",
    description: "Label only. Destination is fixed in code (section anchor).",
    type: "string",
  },
  {
    path: "footer.columns.0.links.2.label",
    label: "Footer column 1 – link 3 label",
    description: "Label only. Destination is fixed in code (section anchor).",
    type: "string",
  },
  {
    path: "footer.columns.0.links.3.label",
    label: "Footer column 1 – link 4 label",
    description: "Label only. Destination is fixed in code (section anchor).",
    type: "string",
  },

  {
    path: "footer.columns.1.title",
    label: "Footer column 2 – title",
    description: "Title for the second footer link column (e.g. “Resources”).",
    type: "string",
  },
  {
    path: "footer.columns.1.links.0.label",
    label: "Footer column 2 – link 1 label",
    description: "Label only. Destination is fixed in code (section anchor).",
    type: "string",
  },
  {
    path: "footer.columns.1.links.1.label",
    label: "Footer column 2 – link 2 label",
    description: "Label only. Destination is fixed in code (section anchor).",
    type: "string",
  },
  {
    path: "footer.columns.1.links.2.label",
    label: "Footer column 2 – link 3 label",
    description: "Label only. Destination is fixed in code (section anchor).",
    type: "string",
  },
  {
    path: "footer.columns.1.links.3.label",
    label: "Footer column 2 – link 4 label",
    description: "Label only. Destination is fixed in code (section anchor).",
    type: "string",
  },

  // CTA block
  {
    path: "footer.cta.title",
    label: "Footer CTA – title",
    description: "Heading for the footer CTA block (e.g. “Get in touch”).",
    type: "string",
  },
  {
    path: "footer.cta.body",
    label: "Footer CTA – body text",
    description:
      "Short paragraph under the CTA heading. Keep it concise and action-oriented.",
    type: "textarea",
  },
  {
    path: "footer.cta.primary.label",
    label: "Footer CTA – primary button label",
    description: "Text on the main CTA button (e.g. “Enquire now”).",
    type: "string",
  },
  {
    path: "footer.cta.secondary.label",
    label: "Footer CTA – secondary button label",
    description: "Text on the secondary button (e.g. “View packages”).",
    type: "string",
  },
  {
    path: "footer.cta.meta.0.label",
    label: "Footer CTA – meta 1 label",
    description: "Short label for the first meta line (e.g. “Time zone:”).",
    type: "string",
  },
  {
    path: "footer.cta.meta.0.value",
    label: "Footer CTA – meta 1 value",
    description: "Value for meta line 1 (e.g. “Hong Kong / Global online”).",
    type: "string",
  },
  {
    path: "footer.cta.meta.1.label",
    label: "Footer CTA – meta 2 label",
    description: "Short label for the second meta line (e.g. “Platform:”).",
    type: "string",
  },
  {
    path: "footer.cta.meta.1.value",
    label: "Footer CTA – meta 2 value",
    description:
      "Value for meta line 2 (e.g. “Zoom · iPad + Apple Pencil recommended”).",
    type: "string",
  },

  // Bottom bar
  {
    path: "footer.bottom.wsmath.rights",
    label: "Footer bottom – rights text",
    description:
      "Short rights statement after the copyright line (e.g. “All rights reserved.”).",
    type: "string",
  },
  {
    path: "footer.bottom.wsmath.disclaimer",
    label: "Footer bottom – disclaimer",
    description:
      "Small note under the copyright line. Keep it short and professional.",
    type: "textarea",
  },
  // Builder credit is hardcoded; no fields needed
];

export const MISC_FIELDS: FieldConfig[] = [
  ...WHATSAPP_GLOBAL_FIELDS,
  ...PRIVACY_POLICY_FIELDS,
  ...FOOTER_FIELDS,
];
