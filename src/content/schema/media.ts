/**
 * Schema primitives.
 *
 * This module owns `MediaRef` plus the small set of helpers every other schema
 * module builds on. It is the only schema file with no dependencies of its own,
 * so it doubles as the primitives module — keeping the helpers here avoids a
 * circular import through `index.ts`.
 *
 * Editor contract (§3.2): every field carries a human label and help
 * string. Those travel into `content.schema.json` via Zod's `.meta()`, which the
 * editor renders as a form. The editor knows nothing about heroes or
 * testimonials — it renders whatever this schema declares.
 */
import { z } from "zod";

/** How the editor should render a field. Advisory — the JSON Schema type is authoritative. */
export type EditorWidget =
  | "text"
  | "textarea"
  | "markdown"
  | "number"
  | "url"
  | "phone"
  | "image"
  | "select"
  | "switch"
  | "id"
  | "collection";

export interface EditorFieldMeta {
  /** Owner-facing label. Written in the owner's own vocabulary. */
  readonly title: string;
  /** Owner-facing help text shown under the input. */
  readonly description?: string;
  readonly widget?: EditorWidget;
  /** Fieldset the editor should group this control into. */
  readonly group?: string;
  /** Sort order inside the group. Lower sorts first. */
  readonly order?: number;
  /** True when the value may contain `{{token.path}}` interpolations. */
  readonly tokens?: boolean;
  /** Emits the schema into `$defs` under this name. Shared shapes only. */
  readonly id?: string;
}

/**
 * Attach editor metadata to a schema. Returns a clone, so the same base schema
 * can be labelled differently at every use site while still de-duplicating into
 * `$defs` when it carries an `id`.
 */
export function field<T extends z.ZodType>(schema: T, meta: EditorFieldMeta): T {
  const attached: Record<string, unknown> = { title: meta.title };
  if (meta.id !== undefined) attached.id = meta.id;
  if (meta.description !== undefined) attached.description = meta.description;
  if (meta.widget !== undefined) attached["x-widget"] = meta.widget;
  if (meta.group !== undefined) attached["x-group"] = meta.group;
  if (meta.order !== undefined) attached["x-order"] = meta.order;
  if (meta.tokens !== undefined) attached["x-tokens"] = meta.tokens;
  return schema.meta(attached) as T;
}

interface TextOptions {
  /** Allow the empty string. Off by default — an empty label is a content bug. */
  readonly allowEmpty?: boolean;
  /** The value may contain `{{token.path}}` interpolations. */
  readonly tokens?: boolean;
  readonly group?: string;
  readonly order?: number;
}

/** A single-line string. */
export function text(title: string, description?: string, options: TextOptions = {}) {
  const base = options.allowEmpty === true ? z.string() : z.string().min(1);
  return field(base, {
    title,
    description,
    widget: "text",
    tokens: options.tokens,
    group: options.group,
    order: options.order,
  });
}

/** A multi-line string. Line breaks are preserved; no markdown. */
export function longText(title: string, description?: string, options: TextOptions = {}) {
  const base = options.allowEmpty === true ? z.string() : z.string().min(1);
  return field(base, {
    title,
    description,
    widget: "textarea",
    tokens: options.tokens,
    group: options.group,
    order: options.order,
  });
}

/** Markdown. A blank line starts a new paragraph. */
export function markdown(title: string, description?: string, options: TextOptions = {}) {
  const base = options.allowEmpty === true ? z.string() : z.string().min(1);
  return field(base, {
    title,
    description,
    widget: "markdown",
    tokens: options.tokens,
    group: options.group,
    order: options.order,
  });
}

/** A whole number. Numbers are numbers — never stored as strings. */
export function integer(title: string, description?: string) {
  return field(z.number().int(), { title, description, widget: "number" });
}

/** A number that may be fractional (durations in months: 1.5 occurs twice). */
export function decimal(title: string, description?: string) {
  return field(z.number(), { title, description, widget: "number" });
}

export function flag(title: string, description?: string) {
  return field(z.boolean(), { title, description, widget: "switch" });
}

export function externalUrl(title: string, description?: string) {
  return field(z.url(), { title, description, widget: "url" });
}

/**
 * A stable identifier. Assigned once at creation and never changed — asset
 * names, cross-references and editor deep links all key off it, never off array
 * position.
 */
export function stableId(
  title = "ID",
  description = "Permanent identifier. Lower-case letters, digits and hyphens, e.g. james-chow-2024. Never change it once set — other records point at it.",
) {
  return field(z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Use lower-case letters, digits and hyphens only."), {
    title,
    description,
    widget: "id",
  });
}

/** Position within a collection. Lowest renders first. */
export function order(title = "Order", description = "Position in the list. Lowest shows first.") {
  return field(z.number().int().min(0), { title, description, widget: "number" });
}

/**
 * An image: the path to the file plus the alt text that must travel with it.
 * Alt text is a sibling field, never hardcoded in a component.
 */
export const MediaRef = z
  .strictObject({
    src: field(
      z.string().regex(/^\//, "Asset paths start with a slash, e.g. /avatars/alice-gao-2022.webp."),
      {
        title: "Image path",
        description: "Path to the file in /public, e.g. /avatars/alice-gao-2022.webp.",
        widget: "image",
      },
    ),
    alt: field(z.string().min(1), {
      title: "Alt text",
      description:
        "Describe what the image shows, for screen readers and for when the image fails to load. Every image needs its own — never reuse one description for two photos.",
      widget: "text",
    }),
    width: field(z.number().int().positive(), {
      title: "Intrinsic width (px)",
      description: "The file's real pixel width. Reserves space so the page does not jump while loading.",
      widget: "number",
    }).optional(),
    height: field(z.number().int().positive(), {
      title: "Intrinsic height (px)",
      description: "The file's real pixel height.",
      widget: "number",
    }).optional(),
  })
  .meta({ id: "MediaRef", title: "Image", description: "An image, its alt text and its intrinsic size." });

export type MediaRef = z.infer<typeof MediaRef>;

/** A labelled `MediaRef` field. */
export function media(title: string, description?: string) {
  return field(MediaRef, { title, description, widget: "image" });
}

/**
 * The eleven canonical CTA ids. Every WhatsApp button on the site is one of
 * these. The order is mirrored, deliberately, by `CTA_IDS` in
 * `src/lib/cta-beacon.ts` — the two lists describe the same set from two sides
 * and drift between them is what this ordering makes visible on sight.
 */
export const CTA_KEYS = [
  "nav",
  "about-ribbon",
  "results",
  "private",
  "ibdp",
  "ial",
  "igcse",
  "ia",
  "video",
  "faq",
  "footer",
] as const;

export const CtaKey = z.enum(CTA_KEYS).meta({
  id: "CtaKey",
  title: "WhatsApp message",
  description:
    "Which prefilled WhatsApp message this button sends. The wording lives in the WhatsApp messages document.",
  "x-widget": "select",
});

export type CtaKey = z.infer<typeof CtaKey>;

/** A short item in an ordered list of copy. Carries an id so it can be reordered safely. */
export function textItem(title: string, description?: string, options: TextOptions = {}) {
  return z.strictObject({
    id: stableId(),
    text: longText(title, description, options),
  });
}
