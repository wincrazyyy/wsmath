// src/app/_components/sections/results/results.tsx
"use client";

import resultsContent from "@/app/_lib/content/json/results.json";
import type { ResultsConfig } from "@/app/_lib/content/types/results.types";

import { ResultsHeader } from "./results-header";
import { ResultsCta } from "./results-cta";
import { ResultsGradeImprovements } from "./results-grade-improvements";

export function Results() {
  const data = resultsContent as ResultsConfig;
  const { header } = data;

  return (
    <>
      {/* Overall results header */}
      <ResultsHeader header={header} />

      {/* Grade improvements section (tabs + heatmap) */}
      <ResultsGradeImprovements />

      {/* CTA under results */}
      <div className="container my-16 max-w-5xl space-y-10">
        <ResultsCta />
      </div>
    </>
  );
}
