// app/_components/sections/packages/packages-header.tsx
import { SectionHeader } from "@/app/_components/ui/section/section-header";
import type { PackagesHeaderConfig } from "@/app/_lib/content/types/packages.types";

type PackagesHeaderProps = {
  header: PackagesHeaderConfig;
};

export function PackagesHeader({ header }: PackagesHeaderProps) {
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
