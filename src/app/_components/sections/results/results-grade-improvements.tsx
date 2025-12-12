// src/app/_components/sections/results/results-grade-improvements.tsx
"use client";

import { useState } from "react";
import { ResultsGradeTabs } from "./results-grade-tabs";
import { GradeImprovementsSection } from "./grade-improvements-section";

// ---------- DATA ----------

const IBDP_HL = [
  { "name": "Marcus", "year": 2025, "from": 6, "to": 7 },
  { "name": "Miriam", "year": 2025, "from": 6, "to": 7 },
  { "name": "Sophia", "year": 2025, "from": 4, "to": 6 },
  { "name": "Josephine", "year": 2025, "from": 4, "to": 6 },
  { "name": "James", "year": 2024, "from": 1, "to": 7, "months": 24 },
  { "name": "Jasmine", "year": 2023, "from": 1, "to": 6 },
  { "name": "Joy", "year": 2022, "from": 5, "to": 7 },
  { "name": "Ethan", "year": 2022, "from": 5, "to": 7 },
  { "name": "Cici", "year": 2022, "from": 6, "to": 7 },
  { "name": "Alice", "year": 2022, "from": 6, "to": 7 },
  { "name": "Mary", "year": 2022, "from": 7, "to": 7 },
  { "name": "Fiona", "year": 2022, "from": 3, "to": 6, "months": 3 },
  { "name": "Janice", "year": 2021, "from": 5, "to": 7 },
  { "name": "Hebe", "year": 2021, "from": 5, "to": 7 },
  { "name": "Vera", "year": 2021, "from": 6, "to": 7 },
  { "name": "Ivy", "year": 2021, "from": 6, "to": 7 },
  { "name": "Taylor", "year": 2019, "from": 6, "to": 7 },
  { "name": "Anthony", "year": 2019, "from": 5, "to": 6 },
  { "name": "Mickey", "year": 2018, "from": 7, "to": 7 },
  { "name": "Lucia", "year": 2018, "from": 3, "to": 6, "months": 3 },
  { "name": "Evelyn", "year": 2018, "from": 5, "to": 6 }
];

const IBDP_SL = [
  { "name": "Jason", "year": 2025, "from": 6, "to": 7 },
  { "name": "Michael", "year": 2025, "from": 6, "to": 7 },
  { "name": "Gordon", "year": 2025, "from": 1, "to": 6 },
  { "name": "Alvina", "year": 2025, "from": 4, "to": 6 },
  { "name": "Sabrina", "year": 2025, "from": 5, "to": 6 },
  { "name": "Kathy", "year": 2024, "from": 1, "to": 6 },
  { "name": "Sharon", "year": 2023, "from": 3, "to": 7, "months": 1.5 },
  { "name": "Cassie", "year": 2023, "from": 4, "to": 7 },
  { "name": "Jasmine", "year": 2023, "from": 4, "to": 6 },
  { "name": "Alexandra","year": 2022, "from": 1, "to": 7 },
  { "name": "Kitty", "year": 2020, "from": 1, "to": 7 },
  { "name": "Chloe", "year": 2020, "from": 4, "to": 7 },
  { "name": "Jenny", "year": 2020, "from": 4, "to": 7 },
  { "name": "Rachel", "year": 2020, "from": 7, "to": 7 },
  { "name": "David", "year": 2020, "from": 4, "to": 6 },
  { "name": "Aidan", "year": 2019, "from": 4, "to": 6 }
];

const AL_FM = [
  { "name": "Bill Zhang", "year": 2024, "from": "F", "to": "A*" },
  { "name": "Bill Ting", "year": 2021, "from": "F", "to": "A*" },
  { "name": "Michelle", "year": 2021, "from": "F", "to": "A*" }
];

const AL_M = [
  { "name": "Quinto", "year": 2025, "from": "F", "to": "A*" },
  { "name": "Coco", "year": 2024, "from": "F", "to": "A" },
  { "name": "Ken", "year": 2024, "from": "F", "to": "A" },
  { "name": "Bill Zhang", "year": 2023, "from": "F", "to": "A*" },
  { "name": "Quintin", "year": 2023, "from": "F", "to": "A" },
  { "name": "Bill Ting", "year": 2021, "from": "F", "to": "A*" },
  { "name": "Michelle", "year": 2021, "from": "B", "to": "A*" },
  { "name": "Jenny", "year": 2020, "from": "B", "to": "A*" }
];

const IGCSE_AM = [
  { "name": "Jacky", "year": 2022, "from": "B(6)", "to": "A(8)" },
  { "name": "James", "year": 2022, "from": "B(6)", "to": "A(8)" },
  { "name": "Emily", "year": 2018, "from": "B", "to": "A*", "months": 2 }
];

const IGCSE_M = [
  { "name": "Janis", "year": 2025, "from": "C", "to": "A*", "months": 3 },
  { "name": "Nicole", "year": 2024, "from": "E(4)", "to": "A(8)" },
  { "name": "Jewel", "year": 2024, "from": "E(4)", "to": "A(8)" },
  { "name": "Cissie", "year": 2023, "from": "F", "to": "A", "months": 12 },
  { "name": "Kelly", "year": 2023, "from": "F", "to": "A", "months": 12 },
  { "name": "Evelyn", "year": 2023, "from": "C", "to": "A" },
  { "name": "Gordon", "year": 2023, "from": "E(4)", "to": "A(8)" },
  { "name": "Bill Zhang", "year": 2022, "from": "B", "to": "A*" },
  { "name": "James", "year": 2022, "from": "B", "to": "A*" },
  { "name": "Ken", "year": 2022, "from": "C", "to": "A" },
  { "name": "Jacky", "year": 2021, "from": "B", "to": "A*" },
  { "name": "Catherine", "year": 2021, "from": "B", "to": "A*" },
  { "name": "Jessica", "year": 2019, "from": "C", "to": "A" }
];

const RESULT_GROUPS = [
  {
    id: "ibdp",
    heading: "IBDP Mathematics",
    items: [
      {
        id: "ib-hl",
        label: "HL",
        programLabel: "IBDP Math HL",
        subtitle: "AAHL / AIHL",
        students: IBDP_HL,
        gradeScale: "ib" as const,
      },
      {
        id: "ib-sl",
        label: "SL",
        programLabel: "IBDP Math SL",
        subtitle: "AASL / AISL",
        students: IBDP_SL,
        gradeScale: "ib" as const,
      },
    ],
  },
  {
    id: "alevel",
    heading: "A-Level Mathematics",
    items: [
      {
        id: "alevel-fmath",
        label: "Further Math",
        programLabel: "A-Level Further Math",
        subtitle: "Edexcel (IAL YFM01) / Cambridge (CAIE 9231)",
        students: AL_FM,
        gradeScale: "letters" as const,
      },
      {
        id: "alevel-math",
        label: "Math",
        programLabel: "A-Level Math",
        subtitle:
          "Edexcel (IAL YMA01) / Cambridge (CAIE 9709) / OCR (H240)",
        students: AL_M,
        gradeScale: "letters" as const,
      },
    ],
  },
  {
    id: "igcse",
    heading: "IGCSE Mathematics",
    items: [
      {
        id: "igcse-add",
        label: "Add Math",
        programLabel: "IGCSE Add Math",
        subtitle: "Cambridge (0606) / Further Math Edexcel (4PM0)",
        students: IGCSE_AM,
        gradeScale: "letters" as const,
      },
      {
        id: "igcse-math",
        label: "Math",
        programLabel: "IGCSE Math",
        subtitle: "Cambridge (0607, 0580) / Math Edexcel (4PM1)",
        students: IGCSE_M,
        gradeScale: "letters" as const,
      },
    ],
  },
] as const;

// ---------- COMPONENT ----------

export function ResultsGradeImprovements() {
  type GroupId = (typeof RESULT_GROUPS)[number]["id"];
  type SubTabId = (typeof RESULT_GROUPS)[number]["items"][number]["id"];

  const [activeGroupId, setActiveGroupId] = useState<GroupId>(
    RESULT_GROUPS[0].id
  );
  const activeGroup =
    RESULT_GROUPS.find((g) => g.id === activeGroupId) ?? RESULT_GROUPS[0];

  const [activeSubId, setActiveSubId] = useState<SubTabId>(
    activeGroup.items[0].id
  );
  const activeItem =
    activeGroup.items.find((i) => i.id === activeSubId) ??
    activeGroup.items[0];

  function handleChangeGroup(id: GroupId) {
    setActiveGroupId(id);
    const group = RESULT_GROUPS.find((g) => g.id === id);
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
        groups={RESULT_GROUPS.map((g) => ({
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
          programLabel={activeItem.programLabel}
          subtitle={activeItem.subtitle}
          students={activeItem.students as any}
          gradeScale={activeItem.gradeScale}
        />
      </div>
    </section>
  );
}