// app/_lib/content/types/results.types.ts
import type { SectionHeaderRightAccent } from "@/app/_components/ui/section/section-header";

export type ResultsHeaderConfig = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  rightAccent?: SectionHeaderRightAccent;
};

export type GradeImprovementsHeaderConfig = {
  title: string;
  description?: string;
};

export type SummaryCardsConfig = {
  top: string;
  second: string;
  bigJumps: string;
  heavyJumps: string;
};

export type ResultGroupConfig = {
  tab: string;
  subTab: string;
  programLabel: string;
  students: Student[];
  gradeScale: string[];
};

export type StudentGrade = number | string;

export type Student = {
  name: string;
  year: number;
  from: StudentGrade;
  to: StudentGrade;
  months?: number;
};

export type HeatmapCell = {
  count: number;
  tooltip?: string;
};

export type HeatmapKey = {
  label: string;
  description?: string;
};

export type HeatmapTableHeaderConfig = {
  keyColumn: string;
  valueColumn: string;
};

export type GradeImprovementsConfig = {
  header: GradeImprovementsHeaderConfig;
  summaryCards: SummaryCardsConfig;
  resultGroups: ResultGroupConfig[];
  tableHeader: HeatmapTableHeaderConfig;
  heatmapKeys: HeatmapKey[];
  footerNote?: string;
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
  gradeImprovements: GradeImprovementsConfig;
  resultsCta: ResultsCtaConfig;
};
