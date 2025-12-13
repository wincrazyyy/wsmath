// src/app/_components/sections/results/results-grade-improvements.tsx
"use client";

import { useState } from "react";
import { GradeImprovementsConfig } from "@/app/_lib/content/types/results.types";

import { ResultsGradeTabs } from "./results-grade-tabs";
import { GradeImprovementsSection } from "./grade-improvements-section";

interface ResultsGradeImprovementsProps {
  gradeImprovements: GradeImprovementsConfig;
}

export function ResultsGradeImprovements({
  gradeImprovements,
}: ResultsGradeImprovementsProps) {
  const {
    header,
    summaryCards,
    resultGroups,
    students,
    table,
    scales,
    footerNote,
  } = gradeImprovements;

  type GroupId = (typeof resultGroups)[number]["id"];
  type SubTabId = (typeof resultGroups)[number]["items"][number]["id"];

  const [activeGroupId, setActiveGroupId] = useState<GroupId>(
    resultGroups[0].id
  );
  const activeGroup =
    resultGroups.find((g) => g.id === activeGroupId) ?? resultGroups[0];

  const [activeSubId, setActiveSubId] = useState<SubTabId>(
    activeGroup.items[0].id
  );
  const activeItem =
    activeGroup.items.find((i) => i.id === activeSubId) ??
    activeGroup.items[0];

  function handleChangeGroup(id: GroupId) {
    setActiveGroupId(id);
    const group = resultGroups.find((g) => g.id === id);
    if (group) {
      setActiveSubId(group.items[0].id as SubTabId);
    }
  }

  function handleChangeSub(id: SubTabId) {
    setActiveSubId(id);
  }

  return (
    <section className="container mt-10 max-w-5xl">
      {/* soft gradient behind the card */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-10 h-32 bg-gradient-to-r from-indigo-100/60 via-sky-100/40 to-transparent blur-2xl" />

        {/* main card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg backdrop-blur">
          {/* tabs header bar */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 pt-3 pb-2 md:px-6">
            <ResultsGradeTabs
              groups={resultGroups.map((g) => ({
                id: g.id,
                heading: g.heading,
                items: g.items.map((i) => ({ id: i.id, label: i.label })),
              }))}
              activeGroupId={activeGroupId}
              activeSubId={activeSubId}
              onChangeGroup={(id) => handleChangeGroup(id as GroupId)}
              onChangeSub={(id) => handleChangeSub(id as SubTabId)}
            />
          </div>

          {/* card body: header + summary + table */}
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
