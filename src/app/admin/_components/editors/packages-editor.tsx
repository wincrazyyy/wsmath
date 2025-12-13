// app/admin/_components/editors/packages-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import {
  PACKAGES_HEADER_FIELDS,
  PACKAGES_COMPARISON_FIELDS,
  PACKAGES_PRIVATE_FIELDS,
  PACKAGES_GROUP_FIELDS,
  PACKAGES_FIELDS
} from "@/app/admin/_lib/fields/packages-fields";
import { JsonEditor } from "./json-editor";

type SubTab = "header" | "comparison" | "private" | "group";

type PackagesEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function PackagesEditor<T extends object>({
  data,
  onChangeData,
}: PackagesEditorProps<T>) {
  const tabs: {
    key: SubTab;
    label: string;
    fields: FieldConfig[];
    panelTitle: string;
    panelDescription: string;
  }[] = [
    {
      key: "header",
      label: "Section header",
      fields: PACKAGES_HEADER_FIELDS,
      panelTitle: "Packages – section header",
      panelDescription:
        "Edit the eyebrow, title, subtitle, chips, and right-hand summary card for the packages section.",
    },
    {
      key: "comparison",
      label: "Comparison strip",
      fields: PACKAGES_COMPARISON_FIELDS,
      panelTitle: "Packages – comparison strip",
      panelDescription:
        "Edit the labels and copy for the pricing comparison strip between 1-to-1 and group.",
    },
    {
      key: "private",
      label: "Private package (1-to-1)",
      fields: PACKAGES_PRIVATE_FIELDS,
      panelTitle: "Packages – private 1-to-1 package",
      panelDescription:
        "Edit the private coaching card: badge, rate, description, bullet points, and the intensive 8-lesson block.",
    },
    {
      key: "group",
      label: "Group package & leaflet",
      fields: PACKAGES_GROUP_FIELDS,
      panelTitle: "Packages – group package & leaflet",
      panelDescription:
        "Edit the group course card and the leaflet preview (pages and auto-advance timing).",
    },
  ];

  return (
    <JsonEditor<T>
      title="Course options & pricing"
      description="Edit the packages header, comparison strip, premium 1-to-1 package, and group course (including the leaflet preview) in separate tabs."
      data={data}
      fields={PACKAGES_FIELDS as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/json/packages.json"
      onChangeData={onChangeData}
      slug="packages"
      enableTabs
      tabs={tabs}
    />
  );
}
