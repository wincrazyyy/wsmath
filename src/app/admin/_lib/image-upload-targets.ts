export type UploadKind = "image" | "video";

export type ImageUploadTarget = {
  note?: string;
  mode?: "single" | "multi";

  kind?: UploadKind;
  accept?: string;

  forcedPublicPathTemplate?: string;
  forcedFileNameTemplate?: string;
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
    note: "Used on the About section hero. Upload a horizontal JPG image banner.",
  },
  "packages.private.privateSrc": {
    note: "Image for the private package card. Upload a horizontal JPG image banner.",
  },
  "packages.group.leaflet.pages": {
    note: "Upload multiple images for the group package leaflet pages. Upload all leaflet pages in JPG format.",
    mode: "multi",
  },
  "testimonials.video.src": {
    kind: "video",
    accept: "video/mp4",
    note: "Student voices video (.mp4). Will be saved as /video/student-voices.mp4",
    forcedPublicPathTemplate: "/video/student-voices.mp4",
    forcedFileNameTemplate: "student-voices.mp4",
  },
  "testimonials.video.poster": {
    kind: "image",
    accept: "image/*",
    note: "Poster image for the student voices video.",
    forcedPublicPathTemplate: "/video/student-voices-poster.jpg",
    forcedFileNameTemplate: "student-voices-poster.jpg",
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
