// app/admin/_components/packages-editor.tsx
"use client";

import type { FieldConfig } from "../_lib/fields";
import { PACKAGES_FIELDS } from "../_lib/packages-fields";
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
  const headerFields: FieldConfig[] = PACKAGES_FIELDS.filter((f) =>
    f.path.startsWith("header."),
  );

  const comparisonFields: FieldConfig[] = PACKAGES_FIELDS.filter((f) =>
    f.path.startsWith("comparison."),
  );

  const privateFields: FieldConfig[] = PACKAGES_FIELDS.filter((f) =>
    f.path.startsWith("private."),
  );

  const groupFields: FieldConfig[] = PACKAGES_FIELDS.filter((f) =>
    f.path.startsWith("group."),
  );

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
      fields: headerFields,
      panelTitle: "Packages – section header",
      panelDescription:
        "Edit the eyebrow, title, subtitle, chips, and right-hand summary card for the packages section.",
    },
    {
      key: "comparison",
      label: "Comparison strip",
      fields: comparisonFields,
      panelTitle: "Packages – comparison strip",
      panelDescription:
        "Edit the labels and copy for the pricing comparison strip between 1-to-1 and group.",
    },
    {
      key: "private",
      label: "Private package (1-to-1)",
      fields: privateFields,
      panelTitle: "Packages – private 1-to-1 package",
      panelDescription:
        "Edit the private coaching card: badge, rate, description, bullet points, and the intensive 8-lesson block.",
    },
    {
      key: "group",
      label: "Group package & leaflet",
      fields: groupFields,
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
      fields={PACKAGES_FIELDS as FieldConfig[]} // full list for non-tab fallback
      jsonFileHint="src/app/_lib/content/json/packages.json"
      onChangeData={onChangeData}
      slug="packages"
      enableTabs
      tabs={tabs}
    />
  );
}
