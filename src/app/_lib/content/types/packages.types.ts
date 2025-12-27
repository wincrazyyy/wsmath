// app/_lib/content/types/packages.types.ts
import type { SectionHeaderRightAccent } from "@/app/_components/ui/section/section-header";

export type PackagesHeaderConfig = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  chips?: string[];
  rightAccent?: SectionHeaderRightAccent;
};

export type ComparisonConfig = {
  privateLabel: string;
  groupLabel: string;
  title: string;
  privateLinePrefix: string;
  groupLineSuffix: string;
};

export type PrivateIntensiveConfig = {
  label: string;
  lessons: string; // parsed as number
  bodyPrefix: string;
  points: string[];
};

export type PrivateConfig = {
  label: string;
  tag?: string;
  rateLabel: string;
  hourlyRate: string; // parsed as number
  title: string;
  description: string;
  points: string[];
  intensive: PrivateIntensiveConfig;
  privateSrc: string;
  bookLabel: string;
  whatsappPrefillText: string;
};

export type GroupLeafletConfig = {
  label: string;
  pages: string[];
  autoAdvanceSeconds: string; // parsed as number
};

export type GroupConfig = {
  label: string;
  tag?: string;
  programmeLabel: string;
  title: string;
  description: string;
  originalPrice: string; // parsed as number
  price: string; // parsed as number
  lessons: string; // parsed as number
  points: string[];
  leaflet?: GroupLeafletConfig;
  bookLabel: string;
  whatsappPrefillText: string;
};

export type IaSupportTopic = {
  title: string;
  desc: string;
};

export type IaSupportConfig = {
  eyebrow: string;
  title: string;
  description: string;

  lessonStructureTitle: string;
  lessonStructure: string[];

  topicsTitle: string;
  topics: IaSupportTopic[];

  bookLabel: string;
  whatsappPrefillText: string;
};

export type PackagesConfig = {
  header: PackagesHeaderConfig;
  comparison: ComparisonConfig;
  private: PrivateConfig;
  group: GroupConfig;
  iaSupport: IaSupportConfig;
};
