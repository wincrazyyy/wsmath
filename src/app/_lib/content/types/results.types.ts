// app/_lib/content/types/results.types.ts
import type { SectionHeaderRightAccent } from "@/app/_components/ui/section/section-header";

export type ResultsHeaderConfig = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  rightAccent?: SectionHeaderRightAccent;
};

export type ResultsCtaConfig = {
  heading: string;
  subheading: string;
  bullets: string[];
  note?: string;
  logoSrc: string;
};

export type ResultsConfig = {
  header: ResultsHeaderConfig;
  resultsCta: ResultsCtaConfig;
};
