// app/admin/_components/editors/packages-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { PackagesConfig } from "@/app/_lib/content/types/packages.types";
import {
  makePackagesHeaderFields,
  PACKAGES_COMPARISON_FIELDS,
  PACKAGES_PRIVATE_FIELDS,
  PACKAGES_GROUP_FIELDS,
  PACKAGES_IA_SUPPORT_FIELDS,
  makePackagesFields,
} from "@/app/admin/_lib/fields/packages-fields";
import { JsonEditor } from "./json-editor";
import {
  getBaseFieldsAndSubTabs,
  type JsonEditorTabConfig,
} from "@/app/admin/_lib/json-editor-helpers";
import { makeEmptyRightAccentColumn } from "@/app/admin/_lib/fields/section-header-fields-helper";

type PackagesEditorProps<T extends PackagesConfig> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function PackagesEditor<T extends PackagesConfig>({
  data,
  onChangeData,
}: PackagesEditorProps<T>) {
  const accentColumnCount = Array.isArray(data.header.rightAccent?.columns) ? data.header.rightAccent.columns.length : 0;

  const [accentColumnBaseFields, accentColumnSubTabs] = getBaseFieldsAndSubTabs(
    makePackagesHeaderFields(accentColumnCount),
    "header.rightAccent.columns",
    "Right Accent Column",
    "Edit this individual right accent column.",
  );
  const tabs: JsonEditorTabConfig[] = [
    {
      key: "header",
      label: "Section header",
      fields: accentColumnBaseFields,
      subTabs: accentColumnSubTabs,
      subTabAdd: {
        listPath: "header.rightAccent.columns",
        buttonLabel: "Add right accent column",
        defaultItem: makeEmptyRightAccentColumn(),
      },
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
    {
      key: "iaSupport",
      label: "IA support",
      fields: PACKAGES_IA_SUPPORT_FIELDS,
      panelTitle: "Packages – IA support",
      panelDescription:
        "Edit the IA support block (structure, topics, and CTA). This content is shown as part of the Solo 1-to-1 offering (not a separate package).",
    },
  ];
  
  const dynamicFields = makePackagesFields({ accentColumnCount });

  return (
    <JsonEditor<T>
      title="Course options & pricing"
      description="Edit the packages header, comparison strip, premium 1-to-1 package, and group course (including the leaflet preview) in separate tabs."
      data={data}
      fields={dynamicFields as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/json/packages.json"
      onChangeData={onChangeData}
      slug="packages"
      enableTabs
      tabs={tabs}
    />
  );
}
