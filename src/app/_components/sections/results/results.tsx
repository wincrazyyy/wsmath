// src/app/_components/sections/results/results.tsx
"use client";

import resultsContent from "@/app/_lib/content/json/results.json";
import type { ResultsConfig } from "@/app/_lib/content/types/results.types";

import { SectionReveal } from "../../ui/section/section-reveal";

import { ResultsHeader } from "./results-header";
import { ResultsGradeImprovements } from "./results-grade-improvements";
import { ResultsCta } from "./results-cta";
import { ResultsSchools } from "./results-schools";

export function Results() {
  const data = resultsContent as ResultsConfig;
  const { header, gradeImprovements, schools, resultsCta } = data;

  return (
    <>
      <ResultsHeader header={header} />

      <SectionReveal>
        <ResultsGradeImprovements gradeImprovements={gradeImprovements} />

        <ResultsSchools data={schools} />

        <div className="container mt-16 max-w-5xl space-y-10">
          <ResultsCta data={resultsCta} />
        </div>
      </SectionReveal>
    </>
  );
}
