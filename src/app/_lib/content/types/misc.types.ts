// src/app/_lib/content/types/misc.types.ts

export type LinkItem = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: LinkItem[];
};

export type FooterMetaItem = {
  label: string;
  value: string;
};

export type FooterBrandConfig = {
  name: string;
  tagline: string;
  description: string;
  iconSrc: string;
  backToTop: LinkItem;
};

export type FooterCtaConfig = {
  title: string;
  body: string;
  primary: LinkItem;
  secondary: LinkItem;
  meta: FooterMetaItem[];
};

export type FooterBottomConfig = {
  wsmath: {
    rights: string;
    disclaimer: string;
  };
  builder: {
    label: string;
    name: string;
    siteUrl: string;
    githubUrl: string;
    stack: string;
  };
};

export type FooterConfig = {
  brand: FooterBrandConfig;
  columns: FooterColumn[];
  cta: FooterCtaConfig;
  bottom: FooterBottomConfig;
};

export type WhatsappConfig = {
  phoneNumber: string;
  prefillText?: string;
};

export type MiscConfig = {
  whatsapp: WhatsappConfig;
  footer: FooterConfig;
};
