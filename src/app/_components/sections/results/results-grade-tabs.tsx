// src/app/_components/sections/results/results-grade-tabs.tsx
"use client";

type ResultsGradeTabsProps = {
  groups: {
    heading: string;
    items: { label: string }[];
  }[];
  activeGroupIndex: number;
  activeSubIndex: number;
  onChangeGroup: (index: number) => void;
  onChangeSub: (index: number) => void;
};

export function ResultsGradeTabs({
  groups,
  activeGroupIndex,
  activeSubIndex,
  onChangeGroup,
  onChangeSub,
}: ResultsGradeTabsProps) {
  const activeGroup = groups[activeGroupIndex] ?? groups[0];

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
    <div className="space-y-2">
      <div className="grid w-full grid-cols-3 text-sm">
        {groups.map((group, gi) => {
          const isActive = gi === activeGroupIndex;
          return (
            <button
              key={`${group.heading}-${gi}`}
              type="button"
              onClick={() => onChangeGroup(gi)}
              className={`
                w-full px-4 py-2 font-medium transition-all
                border-b-2
                ${
                  isActive
                    ? "border-indigo-500 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }
              `}
            >
              {group.heading}
            </button>
          );
        })}
      </div>

      <div className={`grid w-full ${subGridCols} gap-1 text-xs font-semibold`}>
        {activeGroup.items.map((item, ii) => {
          const isActive = ii === activeSubIndex;
          return (
            <button
              key={`${item.label}-${ii}`}
              type="button"
              onClick={() => onChangeSub(ii)}
              className={`
                w-full rounded-md px-3 py-1.5 transition-all
                ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
