import { SectionHeader } from "@/app/_components/ui/section/section-header";
import type { ResultsHeaderConfig } from "@/app/_lib/content/types/results.types";

type ResultsHeaderProps = {
  header: ResultsHeaderConfig;
};

export function ResultsHeader({ header }: ResultsHeaderProps) {
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
