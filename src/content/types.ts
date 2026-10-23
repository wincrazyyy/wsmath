/* Shapes of the JSON in this folder (copied from design/spec/content, plus `bandTitle` from home.js). */

export interface Topic {
  num: string;
  label: string;
  title: string;
  text: string;
}

export interface Course {
  chip: string;
  name: string;
  /** Accessible name of the topic list: `${bandTitle} topics`. */
  bandTitle: string;
  pdfPage: number;
  when: [string, string];
  perks: string[];
  price: string;
  was: string;
  whatsapp: string;
  topics: Topic[];
}

export type PackageShape = 'octa' | 'simplex' | 'pyramid';

export interface Package {
  key: 'ial' | 'ibdp' | 'igcse';
  title: string;
  kicker: string;
  featured: boolean;
  shape: PackageShape;
  cover: string;
  pdf: string;
  pdfPages: string;
  courses: Course[];
}

export interface PackagesFile {
  order: Package['key'][];
  mobileOrder: Package['key'][];
  packages: Package[];
}

export interface IaTheme {
  num: string;
  name: string;
}

export interface Lane {
  index: number;
  name: string;
  cols: number;
  ticks: string[];
  ticksR?: string[];
}

/** A course row of the "Results by course" table; each record names one. */
export type Programme = 'hl' | 'sl' | 'alfm' | 'alm' | 'igadd' | 'igm';

/** One result published by name. */
export interface ResultRecord {
  lane: number;
  programme: Programme;
  name: string;
  year: number;
  course: string;
  from: string;
  to: string;
  uni: string;
}

export interface ResultsFile {
  lanes: Lane[];
  records: ResultRecord[];
}

/** Labels only: the figures are counted from results.json and the school list. */
export interface ResultsTablesFile {
  stats: { stat: 'records' | 'uplift' | 'schools'; label: string }[];
  byCourse: { programme: Programme; course: string }[];
  footnote: string;
  schools: string[];
}

export type VoiceLang = 'en' | 'zh-Hant' | 'zh-HK' | 'zh-Hans';

export interface Voice {
  name: string;
  year: number;
  course: string;
  from: string;
  to: string;
  extra: string;
  dest: string;
  lang: VoiceLang;
  /** The card's pull quote: verbatim from `full`, any cut marked with "…". */
  quote: string;
  /** The testimonial as the student gave it. */
  full: string;
}

export interface TestimonialsFile {
  video: { url: string; title: string; label: string };
  featured: Voice[];
  rowA: Voice[];
  rowB: Voice[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface PrivacyFile {
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  intro: string;
  sections: { id: string; heading: string; body: string }[];
}
