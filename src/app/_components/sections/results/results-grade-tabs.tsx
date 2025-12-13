// src/app/_components/sections/results/results-grade-tabs.tsx
"use client";

type ResultsGradeTabsProps = {
  groups: {
    id: string;
    heading: string;
    items: { id: string; label: string }[];
  }[];
  activeGroupId: string;
  activeSubId: string;
  onChangeGroup: (id: string) => void;
  onChangeSub: (id: string) => void;
};

export function ResultsGradeTabs({
  groups,
  activeGroupId,
  activeSubId,
  onChangeGroup,
  onChangeSub,
}: ResultsGradeTabsProps) {
  const activeGroup =
    groups.find((g) => g.id === activeGroupId) ?? groups[0];

  // Simple mapping so sub-tabs still align nicely if count changes later
  const subCount = activeGroup.items.length;
  const subGridCols =
    subCount === 1
      ? "grid-cols-1"
      : subCount === 2
      ? "grid-cols-2"
      : subCount === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className="w-full">
      {/* Combined tabs block */}
      <div className="w-full rounded-lg bg-slate-100 p-1.5 space-y-1.5 shadow-inner">
        {/* Top-level tabs: IBDP / A-Level / IGCSE */}
        <div className="grid w-full grid-cols-3 gap-1 text-sm">
          {groups.map((group) => {
            const isActive = group.id === activeGroupId;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onChangeGroup(group.id)}
                className={`
                  w-full rounded-md px-4 py-2 font-medium transition-all
                  ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-indigo-300"
                      : "bg-transparent text-slate-600 hover:bg-white hover:text-slate-900"
                  }
                `}
              >
                {group.heading}
              </button>
            );
          })}
        </div>

        {/* Sub-tabs for the active group */}
        <div className={`grid w-full ${subGridCols} gap-1 text-xs font-semibold`}>
          {activeGroup.items.map((item) => {
            const isActive = item.id === activeSubId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeSub(item.id)}
                className={`
                  w-full rounded-md px-4 py-1.5 transition-all
                  ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900"
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
