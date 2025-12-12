// src/app/_components/sections/results/results-grade-improvements.tsx
"use client";

import { useState } from "react";

import { 
  GradeImprovementsConfig, 
  ResultGroupConfig, 
  StudentsMapConfig 
} from "@/app/_lib/content/types/results.types";

import { ResultsGradeTabs } from "./results-grade-tabs";
import { GradeImprovementsSection } from "./grade-improvements-section";

interface ResultsGradeImprovementsProps {
  gradeImprovements: GradeImprovementsConfig;
}

export function ResultsGradeImprovements( { gradeImprovements }: ResultsGradeImprovementsProps ) {
  const resultGroups = gradeImprovements.resultGroups as ResultGroupConfig[];
  const students = gradeImprovements.students as StudentsMapConfig;

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
      {/* Block header inside Results */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Grade improvements at a glance
          </h2>
          <p className="text-sm text-slate-500">
            Explore how students from different programmes improved from
            school predictions to final exam results.
          </p>
        </div>
      </div>

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
          resultItem={activeItem}
          students={students[activeItem.studentsKey]}
        />
      </div>
    </section>
  );
}