// app/admin/_components/editors/results-editor.tsx
"use client";

import type { FieldConfig } from "@/app/admin/_lib/fields/fields";
import {
  RESULTS_HEADER_FIELDS,
  RESULTS_GRADE_IMPROVEMENT_HEADERS_FIELDS,
  RESULTS_GRADE_IMPROVEMENT_DATA_FIELDS,
  RESULTS_GRADE_IMPROVEMENT_MISC_FIELDS,
  RESULTS_CTA_FIELDS,
  RESULTS_FIELDS
} from "@/app/admin/_lib/fields/results-fields";
import { JsonEditor } from "./json-editor";

type SubTab = "header" | "gradeHeaders" | "gradeData" | "gradeMisc" | "cta";

type ResultsEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function ResultsEditor<T extends object>({
  data,
  onChangeData,
}: ResultsEditorProps<T>) {
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
      fields: RESULTS_HEADER_FIELDS,
      panelTitle: "Results – section header",
      panelDescription:
        "Edit the eyebrow, title, and subtitle for the Results section heading.",
    },
    {
      key: "gradeHeaders",
      label: "Grade improvements headers",
      fields: RESULTS_GRADE_IMPROVEMENT_HEADERS_FIELDS,
      panelTitle: "Results – grade improvements headers",
      panelDescription:
        "Configure the headers with summary cards for the grade improvements block.",
    },
    {
      key: "gradeData",
      label: "Grade improvements data",
      fields: RESULTS_GRADE_IMPROVEMENT_DATA_FIELDS,
      panelTitle: "Results – grade improvements data",
      panelDescription:
        "Configure the heatmap tabs and data for the grade improvements block.",
    },
    {
      key: "gradeMisc",
      label: "Grade improvements misc",
      fields: RESULTS_GRADE_IMPROVEMENT_MISC_FIELDS,
      panelTitle: "Results – grade improvements misc",
      panelDescription:
        "Configure the table outline, grade scales, and footer note for the grade improvements block.",
    },
    {
      key: "cta",
      label: "Results CTA box",
      fields: RESULTS_CTA_FIELDS,
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
