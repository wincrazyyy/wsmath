import { SectionHeader } from "../../ui/section/section-header";
import type { TestimonialsHeaderConfig } from "@/app/_lib/content/types/testimonials.types";

type TestimonialsHeaderProps = {
  header: TestimonialsHeaderConfig;
};

export function TestimonialsHeader({ header }: TestimonialsHeaderProps) {
  return (
    <SectionHeader
      align="center"
      eyebrow={header.eyebrow}
      title={header.title}
      subtitle={header.subtitle}
    />
  );
}
