// src/app/_components/sections/results/results-grade-improvements.tsx
"use client";

import { useState } from "react";

import { 
  GradeImprovementsConfig
} from "@/app/_lib/content/types/results.types";

import { ResultsGradeTabs } from "./results-grade-tabs";
import { GradeImprovementsSection } from "./grade-improvements-section";

interface ResultsGradeImprovementsProps {
  gradeImprovements: GradeImprovementsConfig;
}

export function ResultsGradeImprovements( { gradeImprovements }: ResultsGradeImprovementsProps ) {
  const {
    header,
    summaryCards,
    resultGroups,
    students,
    table,
    scales,
    footerNote
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
    <section className="container mt-8 max-w-5xl space-y-8">
      {/* Tabs (own component) */}
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

      {/* Grade improvements heatmap (own component/file) */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
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
    </section>
  );
}