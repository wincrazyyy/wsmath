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
      {/* top-level tabs */}
      <div className="grid w-full grid-cols-3 text-sm">
        {groups.map((group) => {
          const isActive = group.id === activeGroupId;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onChangeGroup(group.id)}
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

      {/* sub-tabs */}
      <div
        className={`grid w-full ${subGridCols} gap-1 text-xs font-semibold`}
      >
        {activeGroup.items.map((item) => {
          const isActive = item.id === activeSubId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeSub(item.id)}
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
