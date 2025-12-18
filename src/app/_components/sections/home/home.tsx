import { SectionReveal } from "../../ui/section/section-reveal";

import { Hero } from "./hero";
import { ProofPills } from "./proof-pills";

export function Home() {
  return (
    <div className="pt-20">
      <SectionReveal>
        <Hero />
        <ProofPills />
      </SectionReveal>
    </div>
  );
}
