// app/admin/_components/about-editor.tsx
"use client";

import type { FieldConfig } from "../_lib/fields";
import { ABOUT_FIELDS } from "../_lib/about-fields";
import { JsonEditor } from "./json-editor";

type AboutEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function AboutEditor<T extends object>({
  data,
  onChangeData,
}: AboutEditorProps<T>) {
  return (
    <JsonEditor<T>
      title="About section content"
      description="Edit the About copy, bullets, stats, and courses."
      data={data}
      fields={ABOUT_FIELDS as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/about.json"
      onChangeData={onChangeData}
    />
  );
}
