// src/app/admin/_components/dashboard/admin-tabs.tsx

import type React from "react";
import type { TabKey } from "@/app/admin/_lib/admin-tabs-config";
import { TABS } from "@/app/admin/_lib/admin-tabs-config";

type AdminTabsProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
};

export const AdminTabs: React.FC<AdminTabsProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <div className="mt-8 inline-flex rounded-full border border-neutral-200 bg-white p-1 text-xs font-medium">
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChangeTab(tab.key)}
            className={`rounded-full px-4 py-1.5 transition ${
              isActive
                ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
