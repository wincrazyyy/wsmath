// src/app/_components/sections/results/results-grade-improvements.tsx
"use client";

import { useState } from "react";
import { GradeImprovementsConfig } from "@/app/_lib/content/types/results.types";

import { ResultsGradeTabs } from "./results-grade-tabs";
import { GradeImprovementsSection } from "./grade-improvements-section";

interface ResultsGradeImprovementsProps {
  gradeImprovements: GradeImprovementsConfig;
}

export function ResultsGradeImprovements({ gradeImprovements }: ResultsGradeImprovementsProps) {
  const { header, summaryCards, resultGroups, students, table, scales, footerNote } =
    gradeImprovements;

  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const activeGroup = resultGroups[activeGroupIndex] ?? resultGroups[0];

  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const activeItem = activeGroup.items[activeSubIndex] ?? activeGroup.items[0];

  function handleChangeGroup(index: number) {
    setActiveGroupIndex(index);
    setActiveSubIndex(0);
  }

  function handleChangeSub(index: number) {
    setActiveSubIndex(index);
  }

  return (
    <section className="container mt-10 max-w-5xl">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-10 h-32 bg-gradient-to-r from-indigo-100/60 via-sky-100/40 to-transparent blur-2xl" />

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg backdrop-blur">
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 pt-3 pb-2 md:px-6">
            <ResultsGradeTabs
              groups={resultGroups}
              activeGroupIndex={activeGroupIndex}
              activeSubIndex={activeSubIndex}
              onChangeGroup={handleChangeGroup}
              onChangeSub={handleChangeSub}
            />
          </div>

          <div className="px-4 py-5 md:px-6 md:py-6">
            <GradeImprovementsSection
              header={header}
              summaryCards={summaryCards}
              resultItem={activeItem}
              students={students[activeItem.studentsKey]}
              table={table}
              scales={scales}
              footerNote={footerNote}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
