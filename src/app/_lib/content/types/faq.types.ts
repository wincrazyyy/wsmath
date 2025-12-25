// app/_lib/content/types/faq.types.ts

export type FaqHeaderConfig = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export type FaqTopConfig = {
  eyebrow: string;
  heading: string;
  subheading: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type FaqItemsConfig = FaqItem[];

export type FaqConfig = {
  header: FaqHeaderConfig;
  top: FaqTopConfig;
  items: FaqItemsConfig;
};
