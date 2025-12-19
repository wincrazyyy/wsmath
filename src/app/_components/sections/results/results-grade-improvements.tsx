// src/app/_components/sections/results/results-grade-improvements.tsx

"use client";

import { useMemo, useState } from "react";
import type {
  GradeImprovementsConfig,
  ResultGroupConfig,
} from "@/app/_lib/content/types/results.types";

import { ResultsGradeTabs } from "./results-grade-tabs";
import { GradeImprovementsSection } from "./grade-improvements-section";

// ---- helpers ----
type TabsModelItem = ResultGroupConfig & { _key: string };
type TabsModelGroup = { tab: string; items: TabsModelItem[] };

function makeKey(x: ResultGroupConfig) {
  return `${(x.tab ?? "").trim()}__${(x.subTab ?? "").trim()}__${(x.programLabel ?? "").trim()}`;
}

function buildTabsModel(flat: ResultGroupConfig[]): TabsModelGroup[] {
  const map = new Map<string, TabsModelItem[]>();

  for (const x of flat) {
    const tab = (x.tab ?? "").trim();
    if (!tab) continue;

    const item: TabsModelItem = { ...x, _key: makeKey(x) };
    const arr = map.get(tab) ?? [];
    arr.push(item);
    map.set(tab, arr);
  }

  return Array.from(map.entries()).map(([tab, items]) => ({
    tab,
    items: items.slice().sort((a, b) => (a.subTab ?? "").localeCompare(b.subTab ?? "")),
  }));
}
// -----------------

interface ResultsGradeImprovementsProps {
  gradeImprovements: GradeImprovementsConfig;
}

export function ResultsGradeImprovements({ gradeImprovements }: ResultsGradeImprovementsProps) {
  const { header, summaryCards, resultGroups, tableHeader, footerNote } = gradeImprovements;

  const model = useMemo(() => buildTabsModel(resultGroups ?? []), [resultGroups]);
  if (model.length === 0) return null;

  const firstGroup = model[0];
  const firstItem = firstGroup.items[0];

  const [activeTab, setActiveTab] = useState<string>(firstGroup.tab);
  const [activeItemKey, setActiveItemKey] = useState<string>(firstItem._key);

  const activeGroup = model.find((g) => g.tab === activeTab) ?? model[0];
  const activeItem =
    activeGroup.items.find((i) => i._key === activeItemKey) ?? activeGroup.items[0];

  function handleChangeTab(tab: string) {
    setActiveTab(tab);
    const g = model.find((x) => x.tab === tab);
    setActiveItemKey(g?.items?.[0]?._key ?? "");
  }

  function handleChangeSub(itemKey: string) {
    setActiveItemKey(itemKey);
  }

  if (!activeItem) return null;

  return (
    <section className="container mt-10 max-w-5xl">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-10 h-32 bg-gradient-to-r from-indigo-100/60 via-sky-100/40 to-transparent blur-2xl" />

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg backdrop-blur">
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 pb-2 pt-3 md:px-6">
            <ResultsGradeTabs
              groups={model}
              activeTab={activeTab}
              activeItemKey={activeItemKey}
              onChangeTab={handleChangeTab}
              onChangeSub={handleChangeSub}
            />
          </div>

          <div className="px-4 py-5 md:px-6 md:py-6">
            <GradeImprovementsSection
              header={header}
              summaryCards={summaryCards}
              resultItem={activeItem}
              tableHeader={tableHeader}
              footerNote={footerNote}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
