import type { SectionHeaderRightAccent } from "@/app/_components/ui/section/section-header";

export type AboutHeaderConfig = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  chips?: string[];
  rightAccent?: SectionHeaderRightAccent;
};

export type AboutHeroArea = {
  title: string;
  items: string[];
};

export type AboutHeroConfig = {
  imageSrc: string;
  eyebrow?: string;
  area1: AboutHeroArea;
  area2: AboutHeroArea;
};

export type CoursesSectionGroupConfig = {
  title: string;
  caption?: string;
  emphasize?: boolean;
  courses: string[];
  cta: {
    label: string;
    prefillText: string;  
    ariaLabel?: string;
  };
};

export type CoursesSectionConfig = {
  title: string;
  strapline: string;
  intro: string;
  groups: CoursesSectionGroupConfig[];
};

export type AboutConfig = {
  header: AboutHeaderConfig;
  hero: AboutHeroConfig;
  stats: string[];
  coursesSection: CoursesSectionConfig;
};
