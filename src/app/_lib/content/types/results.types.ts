// app/_lib/content/types/results.types.ts
import type { SectionHeaderRightAccent } from "@/app/_components/ui/section/section-header";

export type ResultsHeaderConfig = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  rightAccent?: SectionHeaderRightAccent;
};

export type ResultItemConfig = {
  id: string;
  label: string;
  programLabel: string;
  subtitle?: string;
  studentsKey: string;
  gradeScale: string;
};

export type ResultGroupConfig = {
  id: string;
  heading: string;
  items: ResultItemConfig[];
};

export type StudentGrade = number | string;

export type Student = {
  name: string;
  year: number;
  from: StudentGrade;
  to: StudentGrade;
  months?: number;
};

export type StudentsMapConfig = {
  [studentsKey: string]: Student[];
};

export type GradeImprovementsConfig = {
  resultGroups: ResultGroupConfig[];
  students: StudentsMapConfig;
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
