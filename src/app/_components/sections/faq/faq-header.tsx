import { SectionHeader } from "@/app/_components/ui/section/section-header";
import type { FaqHeaderConfig } from "@/app/_lib/content/types/faq.types";

type FaqHeaderProps = {
  header: FaqHeaderConfig;
};

export function FaqHeader({ header }: FaqHeaderProps) {
  return (
    <SectionHeader
      align="center"
      eyebrow={header.eyebrow}
      title={header.title}
      subtitle={header.subtitle}
    />
  );
}
