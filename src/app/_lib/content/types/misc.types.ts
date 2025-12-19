// src/app/_lib/content/types/misc.types.ts

export type WhatsappConfig = {
  phoneNumber: string;
  prefillText?: string;
};

export type MiscConfig = {
  whatsapp: WhatsappConfig;
};
