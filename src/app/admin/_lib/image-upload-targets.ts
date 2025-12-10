// app/admin/_lib/image-upload-targets.ts
export type ImageUploadTarget = {
  note?: string;
  mode?: "single" | "multi";
};

/**
 * Map JSON field paths (optionally prefixed by slug) to image targets.
 *
 * Convention:
 *   - "home.hero.imageSrc"   → home.json, path hero.imageSrc
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
  "testimonials.testimonialsCta.logoSrc": {
    note: "Used in the Testimonials CTA section. Upload a square-ish PNG image with transparent background.",
  },
};
