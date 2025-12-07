// app/admin/_components/home-editor.tsx
"use client";

import type { FieldConfig } from "../_lib/fields";
import { HOME_FIELDS } from "../_lib/home-fields";
import { JsonEditor } from "./json-editor";

type HomeEditorProps<T extends object> = {
  data: T;
  onChangeData: (next: T) => void;
};

export function HomeEditor<T extends object>({
  data,
  onChangeData,
}: HomeEditorProps<T>) {
  return (
    <JsonEditor<T>
      title="Homepage content"
      description="Edit hero and proof-pills for the homepage."
      data={data}
      fields={HOME_FIELDS as FieldConfig[]}
      jsonFileHint="src/app/_lib/content/home.json"
      onChangeData={onChangeData}
    />
  );
}
