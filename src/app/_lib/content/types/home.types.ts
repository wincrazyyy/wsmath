// src/app/_lib/content/types/home.types.ts

export type HomeHeroStatConfig = {
  value: string;
  label: string;
  subLabel?: string;
};

export type HomeHeroConfig = {
  title: string;
  subtitle?: string;
  tagline?: string;
  imageSrc: string;
  stat?: HomeHeroStatConfig;
};

export type HomeConfig = {
  hero: HomeHeroConfig;
  proofPills?: string[];
};
