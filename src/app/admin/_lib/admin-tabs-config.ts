// src/app/admin/_components/admin-tabs-config.ts

export type TabKey = "home" | "about" | "testimonials" | "packages" | "misc";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "packages", label: "Packages" },
  { key: "testimonials", label: "Testimonials" },
  { key: "misc", label: "Misc" },
];
