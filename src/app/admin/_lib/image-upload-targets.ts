// app/admin/_lib/image-upload-targets.ts
export type ImageUploadTarget = {
  /** Path inside the repo, e.g. "public/hero.png" */
  targetPath: string;
  /** Public path used by <Image>, e.g. "/hero.png" */
  publicPath: string;
  /** Optional note to show in the UI */
  note?: string;
};

/**
 * Map JSON field paths (optionally prefixed by slug) to image targets.
 *
 * Convention:
 *   - "home.hero.imageSrc"   → home.json, path hero.imageSrc
 */
export const IMAGE_UPLOAD_TARGETS: Record<string, ImageUploadTarget> = {
  "home.hero.imageSrc": {
    targetPath: "public/hero.png",
    publicPath: "/hero.png",
    note: "Used on the homepage hero. Upload a square-ish image.",
  },
  "about.hero.imageSrc": {
    targetPath: "public/about-hero.png",
    publicPath: "/about-hero.png",
    note: "Used on the About section hero. Upload a horizontal image.",
  },
  "testimonials.testimonialsCta.logoSrc": {
    targetPath: "public/cta-image.png",
    publicPath: "/cta-image.png",
    note: "Used in the Testimonials CTA section. Upload a square-ish image.",
  },
};
