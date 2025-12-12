// app/admin/_components/editors/results-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import { RESULTS_FIELDS } from "@/app/admin/_lib/fields/results-fields";
import { JsonEditor } from "./json-editor";

type SubTab = "header" | "cta";

type ResultsEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function ResultsEditor<T extends object>({
  data,
  onChangeData,
}: ResultsEditorProps<T>) {
  const headerFields: FieldConfig[] = RESULTS_FIELDS.filter((f) =>
    f.path.startsWith("header."),
  );

  const ctaFields: FieldConfig[] = RESULTS_FIELDS.filter((f) =>
    f.path.startsWith("resultsCta."),
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
      panelTitle: "Results – section header",
      panelDescription:
        "Edit the eyebrow, title, and subtitle for the Results section heading.",
    },
    {
      key: "cta",
      label: "Results CTA box",
      fields: ctaFields,
      panelTitle: "Results CTA box",
      panelDescription:
        "Controls the heading, bullets, note, and logo for the WhatsApp CTA box displayed under the results section.",
    },
  ];

  return (
    <JsonEditor<T>
      title="Results"
      description="Edit the results header, grade improvements, and WhatsApp CTA box."
      data={data}
      fields={RESULTS_FIELDS as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/json/results.json"
      onChangeData={onChangeData}
      slug="results"
      enableTabs
      tabs={tabs}
    />
  );
}
