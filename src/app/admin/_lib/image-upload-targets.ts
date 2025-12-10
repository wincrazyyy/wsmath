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
 * Map JSON field paths to image targets.
 */
export const IMAGE_UPLOAD_TARGETS: Record<string, ImageUploadTarget> = {
  // Home hero image
  "hero.imageSrc": {
    targetPath: "public/hero.png",
    publicPath: "/hero.png",
    note: "Used on the homepage hero. Upload a 1:1 or 4:5 square-ish image.",
  },

  // Examples you can add later:
  // "heroMobile.imageSrc": {
  //   targetPath: "public/hero-mobile.png",
  //   publicPath: "/hero-mobile.png",
  // },
  // "about.hero.imageSrc": {
  //   targetPath: "public/about-hero.png",
  //   publicPath: "/about-hero.png",
  // },
};
