// app/_components/sections/about/about-header.tsx
import { SectionHeader } from "@/app/_components/ui/section/section-header";
import type { AboutHeaderConfig } from "@/app/_lib/content/types/about.types";

type AboutHeaderProps = {
  header: AboutHeaderConfig;
};

export function AboutHeader({ header }: AboutHeaderProps) {
  return (
    <SectionHeader
      eyebrow={header.eyebrow}
      title={header.title}
      subtitle={header.subtitle}
      align="left"
      chips={header.chips}
      rightAccent={header.rightAccent}
    />
  );
}
