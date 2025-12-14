// src/app/_components/sections/results/results-grade-tabs.tsx
"use client";

type TabsModelItem = {
  _key: string;
  subTab: string;
};

type TabsModelGroup = {
  tab: string;
  items: TabsModelItem[];
};

type ResultsGradeTabsProps = {
  groups: TabsModelGroup[];
  activeTab: string;
  activeItemKey: string;
  onChangeTab: (tab: string) => void;
  onChangeSub: (itemKey: string) => void;
};

export function ResultsGradeTabs({
  groups,
  activeTab,
  activeItemKey,
  onChangeTab,
  onChangeSub,
}: ResultsGradeTabsProps) {
  const activeGroup = groups.find((g) => g.tab === activeTab) ?? groups[0];

  const items = activeGroup?.items ?? [];

  const hasMeaningfulSubTabs =
    items.length > 1 && items.some((i) => (i.subTab ?? "").trim().length > 0);

  // layout columns for sub tabs
  const subCount = items.length;
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
        {groups.map((g) => {
          const isActive = g.tab === activeTab;
          return (
            <button
              key={g.tab}
              type="button"
              onClick={() => onChangeTab(g.tab)}
              className={`
                w-full px-4 py-2 font-medium transition-all border-b-2
                ${
                  isActive
                    ? "border-indigo-500 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                }
              `}
            >
              {g.tab}
            </button>
          );
        })}
      </div>

      {/* sub-tabs (optional) */}
      {hasMeaningfulSubTabs && (
        <div className={`grid w-full ${subGridCols} gap-1 text-xs font-semibold`}>
          {items.map((item) => {
            const isActive = item._key === activeItemKey;
            const label = (item.subTab ?? "").trim() || "All"; // if you prefer not to show "All", replace with "" and skip
            return (
              <button
                key={item._key}
                type="button"
                onClick={() => onChangeSub(item._key)}
                className={`
                  w-full rounded-md px-3 py-1.5 transition-all
                  ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
