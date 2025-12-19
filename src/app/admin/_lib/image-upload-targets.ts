export type ImageUploadTarget = {
  note?: string;
  mode?: "single" | "multi";

  /**
   * Optional templates to force where the uploaded file is saved
   * and what value is written into JSON.
   *
   * Supported placeholders:
   *  - {{index0}}: zero-based array index (e.g. 0,1,2)
   *  - {{index1}}: one-based array index (e.g. 1,2,3)
   */
  forcedPublicPathTemplate?: string; // e.g. "/avatars/carousel-{{index1}}.png"
  forcedFileNameTemplate?: string;   // e.g. "carousel-{{index1}}.png"
};

export type ResolvedImageUploadTarget = {
  target: ImageUploadTarget;
  forcedPublicPath?: string;
  forcedFileName?: string;
};

/**
 * Map JSON field paths (optionally prefixed by slug) to image targets.
 *
 * Supports wildcard array patterns:
 *   - "testimonials.carousel[*].avatarSrc"
 */
export const IMAGE_UPLOAD_TARGETS: Record<string, ImageUploadTarget> = {
  "home.hero.imageSrc": {
    note: "Used on the homepage hero. Upload a square-ish PNG image with transparent background.",
  },
  "about.hero.imageSrc": {
    note: "Used on the About section hero. Upload a horizontal PNG image with transparent background.",
  },
  "packages.group.leaflet.pages": {
    note: "Upload multiple images for the group package leaflet pages. Upload all leaflet pages in PNG format.",
    mode: "multi",
  },
  "testimonials.featured[*].avatarSrc": {
    note: "Featured avatar. Will be saved as /avatars/featured-<id>.png (id = tab number).",
    forcedPublicPathTemplate: "/avatars/featured-{{index1}}.png",
    forcedFileNameTemplate: "featured-{{index1}}.png",
  },
  "testimonials.carousel[*].avatarSrc": {
    note: "Carousel avatar. Will be saved as /avatars/carousel-<id>.png (id = tab number).",
    forcedPublicPathTemplate: "/avatars/carousel-{{index1}}.png",
    forcedFileNameTemplate: "carousel-{{index1}}.png",
  },
  "testimonials.testimonialsCta.logoSrc": {
    note: "Used in the Testimonials CTA section. Upload a square-ish PNG image with transparent background.",
  },
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyIndexTemplate(template: string, index0: number): string {
  const index1 = index0 + 1;
  return template
    .replaceAll("{{index0}}", String(index0))
    .replaceAll("{{index1}}", String(index1));
}

/**
 * Resolve either an exact path match or a wildcard array match:
 *  "testimonials.carousel[3].avatarSrc" matches "testimonials.carousel[*].avatarSrc"
 */
export function resolveImageUploadTarget(fieldPathKey: string): ResolvedImageUploadTarget | null {
  // 1) exact match
  const exact = IMAGE_UPLOAD_TARGETS[fieldPathKey];
  if (exact) return { target: exact };

  // 2) wildcard match
  for (const [patternKey, target] of Object.entries(IMAGE_UPLOAD_TARGETS)) {
    if (!patternKey.includes("[*]")) continue;

    // turn "testimonials.carousel[*].avatarSrc"
    // into regex: ^testimonials\.carousel\[(\d+)\]\.avatarSrc$
    const re = new RegExp(
      "^" +
        escapeRegExp(patternKey)
          .replace("\\[\\*\\]", "\\[(\\d+)\\]") +
        "$"
    );

    const m = fieldPathKey.match(re);
    if (!m) continue;

    const index0 = Number(m[1]);
    if (!Number.isFinite(index0)) continue;

    const forcedPublicPath = target.forcedPublicPathTemplate
      ? applyIndexTemplate(target.forcedPublicPathTemplate, index0)
      : undefined;

    const forcedFileName = target.forcedFileNameTemplate
      ? applyIndexTemplate(target.forcedFileNameTemplate, index0)
      : undefined;

    return { target, forcedPublicPath, forcedFileName };
  }

  return null;
}
