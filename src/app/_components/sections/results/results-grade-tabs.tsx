// src/app/_components/sections/results/results-grade-tabs.tsx
"use client";

type ResultsGradeTabsProps = {
  groups: {
    id: string;
    heading: string;
    items: {
      id: string;
      label: string;
    }[];
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

  return (
    <div className="space-y-4">
      {/* Top-level tabs: IBDP / A-Level / IGCSE */}
      <div className="flex overflow-x-auto rounded-full bg-gradient-to-r from-indigo-50 to-slate-100 p-1 text-sm shadow-inner">
        {groups.map((group) => {
          const isActive = group.id === activeGroupId;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onChangeGroup(group.id)}
              className={`
                whitespace-nowrap rounded-full px-5 py-2 font-medium transition-all
                ${
                  isActive
                    ? "bg-white text-slate-900 shadow-md ring-1 ring-indigo-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }
              `}
            >
              {group.heading}
            </button>
          );
        })}
      </div>

      {/* Sub-tabs for the active group */}
      <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100/70 p-1.5">
        {activeGroup.items.map((item) => {
          const isActive = item.id === activeSubId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeSub(item.id)}
              className={`
                rounded-lg px-4 py-1.5 text-xs font-semibold transition-all
                ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }
              `}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
