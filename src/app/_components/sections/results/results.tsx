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

        <ResultsCta data={resultsCta} />
      </SectionReveal>
    </>
  );
}
